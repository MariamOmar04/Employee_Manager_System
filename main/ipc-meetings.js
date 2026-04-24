// ============================================================
//  main/ipc-meetings.js — Réunions
// ============================================================

module.exports = function (ipcMain, db) {

  // Toutes les réunions
  ipcMain.handle('meetings:getAll', () => {
    return db.all('SELECT * FROM meetings ORDER BY meetingDate DESC')
  })

  // Réunions d'un employé (selon participants)
  ipcMain.handle('meetings:getMine', (_, id) => {
    return db.all(
      "SELECT * FROM meetings WHERE participants LIKE ? ORDER BY meetingDate DESC",
      [`%${id}%`]
    )
  })

  // Créer une réunion
  ipcMain.handle('meetings:add', (_, m) => {
    try {
      db.run(
        `INSERT INTO meetings (title,objective,meetingDate,startTime,duration,location,participants)
         VALUES (?,?,?,?,?,?,?)`,
        [m.title, m.objective, m.meetingDate, m.startTime, m.duration, m.location, m.participants]
      )
      return { ok: true }
    } catch (err) {
      return { ok: false, message: err.message }
    }
  })
}
