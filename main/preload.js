// ============================================================
//  main/preload.js — Pont sécurisé entre les pages et le main
//  Chaque fonction ici correspond à un appel vers main.js
// ============================================================

const { contextBridge, ipcRenderer } = require('electron')

// On expose une API sécurisée appelée "window.api" dans les pages HTML
contextBridge.exposeInMainWorld('api', {

  // ── Authentification ──────────────────────────────────────
  loginDirector : (data) => ipcRenderer.invoke('auth:director', data),
  loginEmployee : (data) => ipcRenderer.invoke('auth:employee', data),

  // ── Employés ──────────────────────────────────────────────
  getEmployees  : ()     => ipcRenderer.invoke('employees:getAll'),
  addEmployee   : (data) => ipcRenderer.invoke('employees:add', data),
  updateEmployee: (data) => ipcRenderer.invoke('employees:update', data),
  deleteEmployee: (id)   => ipcRenderer.invoke('employees:delete', id),

  // ── Présences ─────────────────────────────────────────────
  getAllAttendance: ()   => ipcRenderer.invoke('attendance:getAll'),
  getMyAttendance: (id) => ipcRenderer.invoke('attendance:getMine', id),
  checkIn        : (id) => ipcRenderer.invoke('attendance:checkin', id),

  // ── Congés ────────────────────────────────────────────────
  getAllLeaves   : ()     => ipcRenderer.invoke('leaves:getAll'),
  getMyLeaves   : (id)   => ipcRenderer.invoke('leaves:getMine', id),
  requestLeave  : (data) => ipcRenderer.invoke('leaves:request', data),
  updateLeave   : (data) => ipcRenderer.invoke('leaves:update', data),

  // ── Réunions ──────────────────────────────────────────────
  getAllMeetings : ()      => ipcRenderer.invoke('meetings:getAll'),
  getMyMeetings : (id)    => ipcRenderer.invoke('meetings:getMine', id),
  addMeeting    : (data)  => ipcRenderer.invoke('meetings:add', data),

  // ── Rapports Excel ────────────────────────────────────────
  exportExcel: (type) => ipcRenderer.invoke('reports:export', type),

  // ── Dashboard stats ───────────────────────────────────────
  getDashboardStats: () => ipcRenderer.invoke('dashboard:stats'),
})
