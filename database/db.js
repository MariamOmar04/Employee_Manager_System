// ============================================================
//  database/db.js — Base de données SQLite
//  Toute la logique de la base de données est ici
// ============================================================

const path = require('path')
const fs   = require('fs')
const { app } = require('electron')

let SQL   // sql.js library
let db    // instance de la base de données

// Chemin du fichier de base de données sur le disque
const DB_FILE = path.join(app.getPath('userData'), 'staffhub.db')

// ── Sauvegarder la base sur le disque ───────────────────────
function save () {
  const data   = db.export()
  const buffer = Buffer.from(data)
  fs.mkdirSync(path.dirname(DB_FILE), { recursive: true })
  fs.writeFileSync(DB_FILE, buffer)
}

// ── Exécuter une requête (INSERT, UPDATE, DELETE, CREATE) ────
function run (sql, params = []) {
  db.run(sql, params)
  save()
}

// ── Lire plusieurs lignes (SELECT) ───────────────────────────
function all (sql, params = []) {
  try {
    const stmt = db.prepare(sql)
    stmt.bind(params)
    const rows = []
    while (stmt.step()) rows.push(stmt.getAsObject())
    stmt.free()
    return rows
  } catch (e) {
    console.error('DB all() error:', e.message)
    return []
  }
}

// ── Lire une seule ligne (SELECT ... LIMIT 1) ────────────────
function get (sql, params = []) {
  const rows = all(sql, params)
  return rows[0] || null
}

// ── Créer toutes les tables ───────────────────────────────────
function createTables () {
  // Table directeurs
  run(`CREATE TABLE IF NOT EXISTS directors (
    id        INTEGER PRIMARY KEY AUTOINCREMENT,
    firstName TEXT NOT NULL,
    lastName  TEXT NOT NULL,
    email     TEXT UNIQUE NOT NULL,
    secretKey TEXT NOT NULL,
    password  TEXT NOT NULL
  )`)

  // Table employés
  run(`CREATE TABLE IF NOT EXISTS employees (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    employeeId TEXT UNIQUE NOT NULL,
    firstName  TEXT NOT NULL,
    lastName   TEXT NOT NULL,
    email      TEXT UNIQUE NOT NULL,
    phone      TEXT,
    department TEXT,
    position   TEXT,
    salary     REAL DEFAULT 0,
    bonus      REAL DEFAULT 0,
    status     TEXT DEFAULT 'Active',
    joinDate   TEXT
  )`)

  // Table présences
  run(`CREATE TABLE IF NOT EXISTS attendance (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    employeeId TEXT NOT NULL,
    date       TEXT NOT NULL,
    checkIn    TEXT,
    checkOut   TEXT,
    status     TEXT DEFAULT 'Present'
  )`)

  // Table demandes de congé
  run(`CREATE TABLE IF NOT EXISTS leaves (
    id           INTEGER PRIMARY KEY AUTOINCREMENT,
    employeeId   TEXT NOT NULL,
    type         TEXT NOT NULL,
    startDate    TEXT NOT NULL,
    endDate      TEXT NOT NULL,
    reason       TEXT,
    status       TEXT DEFAULT 'Pending',
    directorNote TEXT,
    createdAt    TEXT DEFAULT (date('now'))
  )`)

  // Table réunions
  run(`CREATE TABLE IF NOT EXISTS meetings (
    id           INTEGER PRIMARY KEY AUTOINCREMENT,
    title        TEXT NOT NULL,
    objective    TEXT,
    meetingDate  TEXT NOT NULL,
    startTime    TEXT NOT NULL,
    duration     INTEGER NOT NULL,
    location     TEXT,
    participants TEXT,
    createdAt    TEXT DEFAULT (date('now'))
  )`)
}

// ── Insérer des données de démonstration ─────────────────────
function seedData () {
  // Directeur par défaut
  if (!get('SELECT id FROM directors LIMIT 1')) {
    run(`INSERT INTO directors (firstName,lastName,email,secretKey,password)
         VALUES ('Jean','Dupont','directeur@staffhub.com','STAFF-2024-KEY','Admin@1234')`)
  }

  // Employés par défaut
  if (!get('SELECT id FROM employees LIMIT 1')) {
    const list = [
      ['EMP-001','Sarah','Johnson','sarah.j@company.com','+1 555-0101','Design','Product Designer',75000,5000,'Active','2023-01-15'],
      ['EMP-002','Michael','Chen','m.chen@company.com','+1 555-0102','Engineering','Senior Developer',95000,8000,'Active','2022-03-20'],
      ['EMP-003','Emily','Williams','e.williams@company.com','+1 555-0103','Marketing','Marketing Lead',70000,4500,'On Leave','2021-06-10'],
      ['EMP-004','James','Rodriguez','j.rodriguez@company.com','+1 555-0104','Human Resources','HR Manager',80000,6000,'Active','2020-09-01'],
      ['EMP-005','Aisha','Patel','a.patel@company.com','+1 555-0105','Analytics','Data Analyst',85000,7000,'Active','2022-11-05'],
      ['EMP-006','David','Kim','d.kim@company.com','+1 555-0106','Engineering','DevOps Engineer',90000,7500,'Remote','2021-04-12'],
    ]
    list.forEach(e => run(
      `INSERT INTO employees (employeeId,firstName,lastName,email,phone,department,position,salary,bonus,status,joinDate)
       VALUES (?,?,?,?,?,?,?,?,?,?,?)`, e
    ))

    // Quelques présences aujourd'hui
    const today = new Date().toISOString().split('T')[0]
    run(`INSERT INTO attendance (employeeId,date,checkIn,status) VALUES ('EMP-001',?,'08:32','Present')`, [today])
    run(`INSERT INTO attendance (employeeId,date,checkIn,status) VALUES ('EMP-002',?,'09:05','Present')`, [today])
    run(`INSERT INTO attendance (employeeId,date,checkIn,checkOut,status) VALUES ('EMP-004',?,'08:00','17:00','Present')`, [today])

    // Quelques demandes de congé
    run(`INSERT INTO leaves (employeeId,type,startDate,endDate,reason,status)
         VALUES ('EMP-003','Annual Leave','2024-07-01','2024-07-10','Vacances famille','Approved')`)
    run(`INSERT INTO leaves (employeeId,type,startDate,endDate,reason,status)
         VALUES ('EMP-005','Sick Leave','2024-06-20','2024-06-21','Rendez-vous médical','Pending')`)

    // Quelques réunions
    const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0]
    run(`INSERT INTO meetings (title,objective,meetingDate,startTime,duration,location,participants)
         VALUES ('Revue Q2','Réviser les objectifs du trimestre',?,'10:00',90,'Salle A','EMP-001,EMP-002,EMP-004')`, [tomorrow])
    run(`INSERT INTO meetings (title,objective,meetingDate,startTime,duration,location,participants)
         VALUES ('Sprint Planning','Planifier le sprint de 2 semaines',?,'14:00',60,'Salle B','EMP-002,EMP-006')`, [today])
  }
}

// ── Initialiser la base (appelé au démarrage) ─────────────────
async function init () {
  const initSqlJs = require('sql.js')
  SQL = await initSqlJs()

  // Charger depuis le fichier si il existe, sinon créer une nouvelle DB
  if (fs.existsSync(DB_FILE)) {
    const buffer = fs.readFileSync(DB_FILE)
    db = new SQL.Database(buffer)
  } else {
    db = new SQL.Database()
  }

  createTables()
  seedData()
  console.log('✅ Base de données initialisée:', DB_FILE)
}

// Exporter les fonctions pour les utiliser ailleurs
module.exports = { init, run, all, get, save }
