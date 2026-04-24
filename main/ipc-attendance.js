// ============================================================
//  main/ipc-attendance.js — Présences
// ============================================================

module.exports = function (ipcMain, db) {

  // Toutes les présences (pour le directeur)
  ipcMain.handle('attendance:getAll', () => {
    return db.all(`
      SELECT a.*, e.firstName, e.lastName, e.department
      FROM attendance a
      JOIN employees e ON a.employeeId = e.employeeId
      ORDER BY a.date DESC
      LIMIT 100
    `)
  })

  // Présences d'un employé (pour l'employé)
  ipcMain.handle('attendance:getMine', (_, id) => {
    return db.all(
      'SELECT * FROM attendance WHERE employeeId=? ORDER BY date DESC LIMIT 30',
      [id]
    )
  })

  // Check-in ou Check-out
  ipcMain.handle('attendance:checkin', (_, id) => {
    const today = new Date().toISOString().split('T')[0]
    const now   = new Date().toTimeString().slice(0, 5)
    const exist = db.get('SELECT * FROM attendance WHERE employeeId=? AND date=?', [id, today])

    if (!exist) {
      // Première fois aujourd'hui → Check-in
      db.run(
        'INSERT INTO attendance (employeeId,date,checkIn,status) VALUES (?,?,?,?)',
        [id, today, now, 'Present']
      )
      return { ok: true, action: 'checkin', time: now }
    }

    if (!exist.checkOut) {
      // Déjà checké in → Check-out
      db.run('UPDATE attendance SET checkOut=? WHERE employeeId=? AND date=?', [now, id, today])
      return { ok: true, action: 'checkout', time: now }
    }

    // Déjà checké out
    return { ok: false, message: 'Journée déjà terminée.' }
  })
}
