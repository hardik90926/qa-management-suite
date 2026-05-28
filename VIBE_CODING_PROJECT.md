# QA Management Suite — Vibe Coding Project

> Built entirely through conversational AI prompting using **Claude Code** (Anthropic) — no manual scaffolding, no boilerplate copying. Every file was generated, debugged, and deployed through natural language instructions.

---

## What is Vibe Coding?

**Vibe Coding** is a modern development approach where you describe *what* you want to build in plain English and let an AI coding assistant generate the full implementation. You steer with intent; the AI handles syntax, structure, and wiring.

This project was built 100% using Claude Code — from the first folder to the live deployment URL.

---

## Project Overview

| Field | Details |
|-------|---------|
| **Project Name** | QA Management Suite |
| **Type** | Full-Stack Web Application |
| **Built With** | Claude Code (AI-assisted vibe coding) |
| **Time to Build** | ~1 session |
| **Lines of Code** | 27,000+ across 63 files |
| **Live URL** | https://qa-management-suite.onrender.com |
| **GitHub** | https://github.com/hardik90926/qa-management-suite |

---

## Tech Stack

### Frontend
| Technology | Purpose |
|------------|---------|
| React 18 | UI framework |
| React Router 6 | Client-side routing |
| Tailwind CSS 3 | Utility-first styling |
| Recharts | Dashboard charts |
| Axios | HTTP client |
| Context API | Auth + Toast state |

### Backend
| Technology | Purpose |
|------------|---------|
| Node.js 18 | Runtime |
| Express.js 4 | REST API framework |
| Mongoose 8 | MongoDB ODM |
| JWT | Authentication |
| bcryptjs | Password hashing |
| mongodb-memory-server | Zero-install dev DB |

### Database
| Technology | Purpose |
|------------|---------|
| MongoDB Atlas | Cloud database (production) |
| mongodb-memory-server | In-memory DB (development fallback) |

### DevOps
| Technology | Purpose |
|------------|---------|
| Render.com | Free cloud hosting |
| GitHub | Version control |
| Git | Source control |

---

## Features Built

### 1. Authentication System
- JWT-based login / logout
- Protected routes
- Role-based access control
- Token persistence in localStorage

### 2. Bug Tracker
- Full CRUD (Create, Read, Update, Delete)
- Status workflow: `Open → In Progress → Fixed → Closed`
- Priority levels: `Low / Medium / High / Critical`
- Severity levels: `Minor / Major / Blocker`
- Bug assignment to team members
- Search + multi-filter (status, priority, severity)
- Pagination

### 3. Test Case Manager
- Test suites with pass rate progress bars
- Test case creation with step-by-step inputs
- Execution workflow: `Pass / Fail / Blocked / Not Executed`
- Execution comments per test run
- Suite-level statistics

### 4. QA Dashboard
- KPI cards: Total / Open / In Progress / Closed bugs
- Recharts pie chart — bugs by severity
- Recharts bar chart — bugs by priority
- Test execution pie chart — Pass / Fail / Blocked
- Recent bugs table
- Live activity feed

### 5. User Management
- Team member listing with role badges
- Role assignment (Admin only): `Admin / QA Lead / Tester`
- Create new users (Admin only)
- User statistics overview

### 6. Profile Page
- Edit display name
- Change password with confirmation
- Role permissions table
- Account info

---

## Role Permissions Matrix

| Feature | Admin | QA Lead | Tester |
|---------|-------|---------|--------|
| View Dashboard | ✅ | ✅ | ✅ |
| Create / Edit Bugs | ✅ | ✅ | ✅ |
| Delete Bugs | ✅ | ✅ | ❌ |
| Create / Edit Test Cases | ✅ | ✅ | ✅ |
| Delete Test Cases | ✅ | ✅ | ❌ |
| Execute Test Cases | ✅ | ✅ | ✅ |
| View Users | ✅ | ✅ | ✅ |
| Create Users | ✅ | ❌ | ❌ |
| Assign Roles | ✅ | ❌ | ❌ |

---

## Project Structure

```
qa-management-suite/
├── backend/
│   ├── config/
│   │   └── database.js          # MongoDB connection + memory fallback
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── bugController.js
│   │   ├── testCaseController.js
│   │   ├── testSuiteController.js
│   │   ├── dashboardController.js
│   │   ├── userController.js
│   │   └── activityController.js
│   ├── middleware/
│   │   ├── auth.js              # JWT protect + role authorize
│   │   ├── errorHandler.js
│   │   └── validate.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Bug.js
│   │   ├── TestCase.js
│   │   ├── TestSuite.js
│   │   └── Activity.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── bugs.js
│   │   ├── testCases.js
│   │   ├── testSuites.js
│   │   ├── dashboard.js
│   │   ├── users.js
│   │   └── activities.js
│   ├── seed/
│   │   └── seedData.js          # Demo data: 5 users, 10 bugs, 4 suites, 12 test cases
│   ├── utils/
│   │   └── activityLogger.js
│   └── server.js
├── frontend/
│   └── src/
│       ├── components/
│       │   ├── Layout/           # Sidebar, Navbar, Layout wrapper
│       │   └── common/           # Modal, Spinner, Pagination, EmptyState, ConfirmDialog
│       ├── context/
│       │   ├── AuthContext.jsx
│       │   └── ToastContext.jsx
│       ├── pages/
│       │   ├── Login.jsx
│       │   ├── Dashboard.jsx
│       │   ├── BugManagement.jsx
│       │   ├── TestCaseManagement.jsx
│       │   ├── UserManagement.jsx
│       │   └── Profile.jsx
│       ├── services/             # Axios API service layer
│       ├── utils/
│       │   └── helpers.js        # formatDate, getStatusStyle, getInitials, etc.
│       └── App.jsx               # Router + protected routes
├── render.yaml                   # Render.com deployment blueprint
├── package.json                  # Root build/start scripts
├── .gitignore
└── README.md
```

---

## Database Collections

| Collection | Documents (seed) | Key Fields |
|------------|-----------------|------------|
| Users | 5 | name, email, password, role, isActive |
| Bugs | 10 | title, status, priority, severity, assignedTo, createdBy |
| TestSuites | 4 | name, project, createdBy |
| TestCases | 12 | title, steps, status, suite, executedBy |
| Activities | 8 | user, action, entityType, description |

---

## API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/login` | Public | Login |
| GET | `/api/auth/me` | Any | Current user |
| GET | `/api/bugs` | Any | List bugs (filters + pagination) |
| POST | `/api/bugs` | Any | Create bug |
| PUT | `/api/bugs/:id` | Any | Update bug |
| DELETE | `/api/bugs/:id` | Admin/Lead | Delete bug |
| GET | `/api/test-suites` | Any | List suites with counts |
| POST | `/api/test-suites` | Any | Create suite |
| GET | `/api/test-cases` | Any | List test cases |
| POST | `/api/test-cases` | Any | Create test case |
| PUT | `/api/test-cases/:id/execute` | Any | Execute test case |
| GET | `/api/dashboard/metrics` | Any | All dashboard stats |
| GET | `/api/users` | Any | List users |
| PUT | `/api/users/:id/role` | Admin | Update user role |
| GET | `/api/activities` | Any | Activity feed |

---

## Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| **Admin** | admin@qamanager.com | admin123 |
| **QA Lead** | sarah@qamanager.com | password123 |
| **Tester** | mike@qamanager.com | password123 |

---

## How to Run Locally

```bash
# 1. Clone
git clone https://github.com/hardik90926/qa-management-suite.git
cd qa-management-suite

# 2. Start backend (auto-seeds demo data if MongoDB not available)
cd backend
npm install
npm run dev        # runs on http://localhost:5000

# 3. Start frontend (new terminal)
cd frontend
npm install
npm start          # runs on http://localhost:3000
```

> MongoDB is **optional locally** — the app auto-starts an in-memory MongoDB and seeds demo data if no MongoDB instance is found.

---

## Deployment

Hosted on **Render.com** (free tier) with **MongoDB Atlas** (free M0 cluster).

```
Frontend + Backend  →  Render Web Service (Node.js)
Database            →  MongoDB Atlas M0 (512 MB free)
CI/CD               →  Auto-deploy on push to master
```

### One-click redeploy
```bash
git push origin master   # Render auto-deploys on push
```

---

## Vibe Coding Prompts Used

The entire project was generated from a single structured prompt describing:
- Tech stack (React, Node, Express, MongoDB)
- Feature list (Auth, Bug Tracker, Test Cases, Dashboard, Users)
- 5 screens to build
- UI requirements (Tailwind, sidebar, modals, toast, charts)
- Backend MVC architecture
- Database collections

Subsequent prompts handled:
- Running locally in browser
- Fixing dashboard KPI count display bug
- Creating the git repository
- Deploying to Render.com
- Fixing deployment errors (env var naming, devDependencies)

---

## Key Learnings from Vibe Coding This Project

1. **Structure your prompt** — The more specific the feature list, the better the output
2. **One concern at a time** — Debug prompts work best when focused on a single issue
3. **Iterate fast** — Fix → push → redeploy cycles are measured in seconds with AI assistance
4. **AI handles boilerplate** — Auth middleware, CRUD controllers, Tailwind classes — all zero effort
5. **You stay in control** — Vibe coding amplifies your vision; you still make architectural decisions

---

*Built with Claude Code · Anthropic · 2026*