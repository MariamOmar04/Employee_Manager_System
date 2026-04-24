// ============================================================
//  main/ipc-employees.js — CRUD Employés
// ============================================================

module.exports = function (ipcMain, db) {

  // Récupérer tous les employés
  ipcMain.handle('employees:getAll', () => {
    return db.all('SELECT * FROM employees ORDER BY firstName')
  })

  // Ajouter un employé
  ipcMain.handle('employees:add', (_, e) => {
    try {
      db.run(
        `INSERT INTO employees (employeeId,firstName,lastName,email,phone,department,position,salary,bonus,status,joinDate)
         VALUES (?,?,?,?,?,?,?,?,?,?,?)`,
        [e.employeeId, e.firstName, e.lastName, e.email, e.phone,
         e.department, e.position, e.salary, e.bonus, e.status, e.joinDate]
      )
      return { ok: true }
    } catch (err) {
      return { ok: false, message: err.message }
    }
  })

  // Modifier un employé
  ipcMain.handle('employees:update', (_, e) => {
    try {
      db.run(
        `UPDATE employees SET firstName=?,lastName=?,email=?,phone=?,
         department=?,position=?,salary=?,bonus=?,status=? WHERE employeeId=?`,
        [e.firstName, e.lastName, e.email, e.phone,
         e.department, e.position, e.salary, e.bonus, e.status, e.employeeId]
      )
      return { ok: true }
    } catch (err) {
      return { ok: false, message: err.message }
    }
  })

  // Supprimer un employé
  ipcMain.handle('employees:delete', (_, id) => {
    try {
      db.run('DELETE FROM employees WHERE employeeId=?', [id])
      return { ok: true }
    } catch (err) {
      return { ok: false, message: err.message }
    }
  })
}
