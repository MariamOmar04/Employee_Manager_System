// ============================================================
//  main/ipc-auth.js — Gestion de la connexion
// ============================================================

module.exports = function (ipcMain, db) {

  // Connexion directeur
  ipcMain.handle('auth:director', (_, { email, secretKey, password }) => {
    const user = db.get(
      'SELECT * FROM directors WHERE email=? AND secretKey=? AND password=?',
      [email, secretKey, password]
    )
    if (user) return { ok: true, user }
    return { ok: false, message: 'Email, clé secrète ou mot de passe incorrect.' }
  })

  // Connexion employé
ipcMain.handle('auth:employee', (_, { email, employeeId }) => {
  const user = db.get(
    `SELECT * FROM employees 
     WHERE LOWER(email)=LOWER(?) 
     AND UPPER(employeeId)=UPPER(?)`,
    [email.trim(), employeeId.trim()]
  )

  if (user) return { ok: true, user }
  return { ok: false, message: 'Email ou identifiant employé incorrect.' }
})

  // Stats pour le dashboard directeur
  ipcMain.handle('dashboard:stats', () => {
    const total   = db.get('SELECT COUNT(*) as n FROM employees').n
    const active  = db.get("SELECT COUNT(*) as n FROM employees WHERE status='Active'").n
    const onLeave = db.get("SELECT COUNT(*) as n FROM employees WHERE status='On Leave'").n
    const pending = db.get("SELECT COUNT(*) as n FROM leaves WHERE status='Pending'").n
    const byDept  = db.all('SELECT department, COUNT(*) as total FROM employees GROUP BY department')
    const recent  = db.all('SELECT * FROM employees ORDER BY id DESC LIMIT 6')
    const today   = new Date().toISOString().split('T')[0]
    const todayAtt= db.all('SELECT * FROM attendance WHERE date=?', [today])
    return { total, active, onLeave, pending, byDept, recent, todayAtt }
  })
}
