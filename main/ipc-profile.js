// ============================================================
//  main/ipc-profile.js — Gestion du profil directeur
// ============================================================

module.exports = function (ipcMain, db) {

  // Mettre à jour le profil directeur (nom + mot de passe optionnel)
  ipcMain.handle('profile:updateDirector', (_, { id, firstName, lastName, password }) => {
    try {
      if (password) {
        db.run(
          'UPDATE directors SET firstName=?, lastName=?, password=? WHERE id=?',
          [firstName, lastName, password, id]
        )
      } else {
        db.run(
          'UPDATE directors SET firstName=?, lastName=? WHERE id=?',
          [firstName, lastName, id]
        )
      }
      return { ok: true }
    } catch (err) {
      return { ok: false, message: err.message }
    }
  })

  // Récupérer le nombre de réunions pour le dashboard profil
  ipcMain.handle('profile:getMeetingsCount', () => {
    try {
      const result = db.get('SELECT COUNT(*) as n FROM meetings')
      return result ? result.n : 0
    } catch (err) {
      return 0
    }
  })
}
