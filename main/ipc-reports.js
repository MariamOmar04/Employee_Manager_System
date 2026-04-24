// ============================================================
//  main/ipc-reports.js — Export Excel
// ============================================================

const path = require('path')
const os   = require('os')

module.exports = function (ipcMain, db) {

  ipcMain.handle('reports:export', async (_, type) => {
    const ExcelJS   = require('exceljs')
    const workbook  = new ExcelJS.Workbook()
    workbook.creator = 'StaffHub'

    // Style commun pour les en-têtes
    const headerStyle = {
      font: { bold: true, color: { argb: 'FFFFFFFF' } },
      fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E5FBA' } },
      alignment: { horizontal: 'center' }
    }

    if (type === 'employees') {
      const sheet = workbook.addWorksheet('Employés')
      sheet.columns = [
        { header: 'ID',          key: 'employeeId', width: 12 },
        { header: 'Prénom',      key: 'firstName',  width: 15 },
        { header: 'Nom',         key: 'lastName',   width: 15 },
        { header: 'Email',       key: 'email',      width: 28 },
        { header: 'Département', key: 'department', width: 18 },
        { header: 'Poste',       key: 'position',   width: 22 },
        { header: 'Salaire (€)', key: 'salary',     width: 14 },
        { header: 'Prime (€)',   key: 'bonus',      width: 12 },
        { header: 'Statut',      key: 'status',     width: 12 },
      ]
      db.all('SELECT * FROM employees').forEach(e => sheet.addRow(e))
      sheet.getRow(1).eachCell(cell => Object.assign(cell, headerStyle))
    }

    if (type === 'attendance') {
      const sheet = workbook.addWorksheet('Présences')
      sheet.columns = [
        { header: 'ID Employé',  key: 'employeeId', width: 12 },
        { header: 'Prénom',      key: 'firstName',  width: 15 },
        { header: 'Nom',         key: 'lastName',   width: 15 },
        { header: 'Département', key: 'department', width: 18 },
        { header: 'Date',        key: 'date',       width: 12 },
        { header: 'Arrivée',     key: 'checkIn',    width: 10 },
        { header: 'Départ',      key: 'checkOut',   width: 10 },
        { header: 'Statut',      key: 'status',     width: 12 },
      ]
      db.all(`SELECT a.*, e.firstName, e.lastName, e.department
              FROM attendance a JOIN employees e ON a.employeeId=e.employeeId
              ORDER BY a.date DESC`).forEach(r => sheet.addRow(r))
      sheet.getRow(1).eachCell(cell => Object.assign(cell, headerStyle))
    }

    if (type === 'leaves') {
      const sheet = workbook.addWorksheet('Congés')
      sheet.columns = [
        { header: 'ID Employé', key: 'employeeId', width: 12 },
        { header: 'Prénom',     key: 'firstName',  width: 15 },
        { header: 'Nom',        key: 'lastName',   width: 15 },
        { header: 'Type',       key: 'type',       width: 16 },
        { header: 'Début',      key: 'startDate',  width: 12 },
        { header: 'Fin',        key: 'endDate',    width: 12 },
        { header: 'Raison',     key: 'reason',     width: 30 },
        { header: 'Statut',     key: 'status',     width: 12 },
      ]
      db.all(`SELECT l.*, e.firstName, e.lastName
              FROM leaves l JOIN employees e ON l.employeeId=e.employeeId
              ORDER BY l.createdAt DESC`).forEach(r => sheet.addRow(r))
      sheet.getRow(1).eachCell(cell => Object.assign(cell, headerStyle))
    }

    const filePath = path.join(os.homedir(), `staffhub_${type}_${Date.now()}.xlsx`)
    await workbook.xlsx.writeFile(filePath)
    return { ok: true, path: filePath }
  })
}
