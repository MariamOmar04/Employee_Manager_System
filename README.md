# 🏢 StaffHub — Employee Manager System

## 📁 Structure du Projet (organisée et claire)

```
staffhub/
│
├── main.js                  ← Point d'entrée Electron (Main Process)
│
├── database/
│   └── db.js               ← Base de données SQLite (init, run, all, get, save)
│
├── main/
│   ├── preload.js          ← window.api exposée aux pages HTML
│   ├── ipc-auth.js         ← Login directeur & employé
│   ├── ipc-employees.js    ← Ajouter / modifier / supprimer employés
│   ├── ipc-attendance.js   ← Check-in / check-out / historique
│   ├── ipc-leaves.js       ← Demandes et validation de congés
│   ├── ipc-meetings.js     ← Créer et consulter les réunions
│   └── ipc-reports.js      ← Export Excel (ExcelJS)
│
├── shared/
│   ├── style.css           ← CSS partagé par toutes les pages
│   └── login.html          ← Page de connexion (choix du rôle)
│
├── director/               ← Pages du Directeur
│   ├── dashboard.html      ← Stats + 4 graphiques Chart.js
│   ├── employees.html      ← Grille + CRUD employés
│   ├── attendance.html     ← Suivi présences + graphiques
│   ├── leaves.html         ← Validation / refus des congés
│   ├── meetings.html       ← Créer et voir les réunions
│   └── reports.html        ← Export Excel (3 rapports)
│
└── employee/               ← Pages de l'Employé
    ├── dashboard.html      ← Vue personnelle + graphiques
    ├── presence.html       ← Check-in/out + horloge temps réel
    ├── leave.html          ← Demande de congé + historique
    ├── salary.html         ← Salaire + prime + graphique
    └── meetings.html       ← Réunions planifiées
```

## 🚀 Installation

```bash
# 1. Aller dans le dossier
cd staffhub

# 2. Installer les dépendances
npm install

# 3. Lancer l'application
npm start
```

## 🔑 Comptes de Démonstration

| Rôle | Email | Identifiant |
|------|-------|------------|
| **Directeur** | directeur@staffhub.com | Clé: `STAFF-2024-KEY` · Pass: `Admin@1234` |
| **Employé** | sarah.j@company.com | ID: `EMP-001` |
| **Employé** | m.chen@company.com | ID: `EMP-002` |
| **Employé** | e.williams@company.com | ID: `EMP-003` |
| **Employé** | j.rodriguez@company.com | ID: `EMP-004` |
| **Employé** | a.patel@company.com | ID: `EMP-005` |
| **Employé** | d.kim@company.com | ID: `EMP-006` |

## 🛠 Technologies
- **Electron** — Application desktop cross-platform
- **sql.js** — SQLite pur JavaScript (pas de compilation native)
- **Chart.js** — Graphiques modernes et interactifs
- **ExcelJS** — Export de rapports Excel .xlsx
