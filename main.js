// ============================================================
//  main.js — Processus principal Electron (Main Process)
//  C'est le fichier qui démarre toute l'application
// ============================================================

const { app, BrowserWindow, ipcMain } = require('electron')
const path = require('path')

// On importe notre base de données
const db = require('./database/db')

// On importe tous les gestionnaires IPC
// (IPC = communication entre la fenêtre et le processus principal)
const authHandlers      = require('./main/ipc-auth')
const employeeHandlers  = require('./main/ipc-employees')
const attendanceHandlers= require('./main/ipc-attendance')
const leaveHandlers     = require('./main/ipc-leaves')
const meetingHandlers   = require('./main/ipc-meetings')
const reportHandlers    = require('./main/ipc-reports')

// ── Créer la fenêtre principale ──────────────────────────────
function createWindow () {
  const win = new BrowserWindow({
    width : 1400,
    height: 900,
    minWidth : 1100,
    minHeight: 700,
    webPreferences: {
      nodeIntegration : false,       // sécurité : désactivé dans le renderer
      contextIsolation: true,        // sécurité : isoler les contextes
      preload: path.join(__dirname, 'main/preload.js')
    },
    backgroundColor: '#f0f4f9',
    show: false                      // on attend que la page soit chargée
  })

  // Charger la page de login
  win.loadFile(path.join(__dirname, 'shared/login.html'))

  // Afficher la fenêtre une fois chargée (évite l'écran blanc)
  win.once('ready-to-show', () => win.show())
}

// ── Démarrage de l'app ────────────────────────────────────────
app.whenReady().then(async () => {
  // 1. Initialiser la base de données
  await db.init()

  // 2. Enregistrer tous les handlers IPC
  authHandlers(ipcMain, db)
  employeeHandlers(ipcMain, db)
  attendanceHandlers(ipcMain, db)
  leaveHandlers(ipcMain, db)
  meetingHandlers(ipcMain, db)
  reportHandlers(ipcMain, db)

  // 3. Créer la fenêtre
  createWindow()
})

// Quitter quand toutes les fenêtres sont fermées (sauf macOS)
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
