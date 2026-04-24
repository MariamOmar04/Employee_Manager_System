// ============================================================
//  main/ipc-leaves.js — Congés
// ============================================================

module.exports = function (ipcMain, db) {

  // Tous les congés (pour le directeur)
  ipcMain.handle('leaves:getAll', () => {
    return db.all(`
      SELECT l.*, e.firstName, e.lastName, e.department, e.position
      FROM leaves l
      JOIN employees e ON l.employeeId = e.employeeId
      ORDER BY l.createdAt DESC
    `)
  })

  // Congés d'un employé
  ipcMain.handle('leaves:getMine', (_, id) => {
    return db.all(
      'SELECT * FROM leaves WHERE employeeId=? ORDER BY createdAt DESC',
      [id]
    )
  })

  // Demander un congé
  ipcMain.handle('leaves:request', (_, data) => {
    try {
      db.run(
        'INSERT INTO leaves (employeeId,type,startDate,endDate,reason) VALUES (?,?,?,?,?)',
        [data.employeeId, data.type, data.startDate, data.endDate, data.reason]
      )
      return { ok: true }
    } catch (err) {
      return { ok: false, message: err.message }
    }
  })

  // Approuver ou refuser (directeur)
  ipcMain.handle('leaves:update', (_, data) => {
    db.run(
      'UPDATE leaves SET status=?, directorNote=? WHERE id=?',
      [data.status, data.note, data.id]
    )
    return { ok: true }
  })
}
