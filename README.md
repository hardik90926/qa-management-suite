# QA Management Suite

A fully functional, professional QA Management platform built with **React.js**, **Node.js**, **Express.js**, and **MongoDB**.

## Features

- **Authentication** — JWT-based login, protected routes, role-based access (Admin / QA Lead / Tester)
- **Bug Tracker** — Full CRUD, status workflow (Open → In Progress → Fixed → Closed), priority, severity, assignment
- **Test Case Manager** — Test suites, test cases, execution results (Pass / Fail / Blocked), execution comments
- **QA Dashboard** — KPI cards, Recharts pie/bar charts, recent activity feed
- **User Management** — View team, assign roles (Admin only), add new users

## Project Structure

```
Final Project/
├── backend/
│   ├── config/         # Database connection
│   ├── controllers/    # Route handlers
│   ├── middleware/     # Auth, error handling, validation
│   ├── models/         # Mongoose schemas
│   ├── routes/         # Express routes
│   ├── seed/           # Demo data seeder
│   ├── utils/          # Activity logger
│   ├── .env            # Environment variables
│   └── server.js       # Entry point
└── frontend/
    ├── public/
    └── src/
        ├── components/
        │   ├── Layout/   # Sidebar, Navbar, Layout
        │   └── common/   # Modal, Spinner, Pagination, etc.
        ├── context/      # AuthContext, ToastContext
        ├── pages/        # Login, Dashboard, BugManagement, TestCaseManagement, UserManagement, Profile
        ├── services/     # Axios API services
        └── utils/        # Helper functions
```

## Prerequisites

- **Node.js** v18+
- **MongoDB** (local or MongoDB Atlas)
- **npm** or **yarn**

## Setup Instructions

### 1. Clone / Open the Project

```bash
cd "d:/Final Project"
```

### 2. Backend Setup

```bash
cd backend
npm install
```

The `.env` file is pre-configured for local MongoDB. Edit if needed:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/qa_management_suite
JWT_SECRET=qa_suite_secret_key_2024_super_secure
JWT_EXPIRE=7d
NODE_ENV=development
```

### 3. Seed Demo Data

```bash
# From the backend directory
npm run seed
```

This creates 5 users, 10 bugs, 4 test suites, 12 test cases, and activity logs.

### 4. Start the Backend

```bash
npm run dev    # development (nodemon)
# or
npm start      # production
```

Backend runs on **http://localhost:5000**

### 5. Frontend Setup

```bash
cd ../frontend
npm install
npm start
```

Frontend runs on **http://localhost:3000**

---

## Sample Login Credentials

| Role     | Email                    | Password     |
|----------|--------------------------|--------------|
| Admin    | admin@qamanager.com      | admin123     |
| QA Lead  | sarah@qamanager.com      | password123  |
| Tester   | mike@qamanager.com       | password123  |
| Tester   | emily@qamanager.com      | password123  |
| QA Lead  | james@qamanager.com      | password123  |

> You can also click the demo credential buttons on the login screen to auto-fill.

---

## API Endpoints

| Method | Endpoint                          | Description              |
|--------|-----------------------------------|--------------------------|
| POST   | /api/auth/login                   | Login                    |
| GET    | /api/auth/me                      | Get current user         |
| GET    | /api/bugs                         | List bugs (with filters) |
| POST   | /api/bugs                         | Create bug               |
| PUT    | /api/bugs/:id                     | Update bug               |
| DELETE | /api/bugs/:id                     | Delete bug               |
| GET    | /api/test-suites                  | List test suites         |
| POST   | /api/test-suites                  | Create test suite        |
| GET    | /api/test-cases                   | List test cases          |
| POST   | /api/test-cases                   | Create test case         |
| PUT    | /api/test-cases/:id/execute       | Execute test case        |
| GET    | /api/dashboard/metrics            | Dashboard data           |
| GET    | /api/users                        | List users               |
| PUT    | /api/users/:id/role               | Update user role         |

---

## Role Permissions

| Feature                   | Admin | QA Lead | Tester |
|---------------------------|-------|---------|--------|
| View Dashboard            | ✓     | ✓       | ✓      |
| Create/Edit Bugs          | ✓     | ✓       | ✓      |
| Delete Bugs               | ✓     | ✓       | ✗      |
| Create/Edit Test Cases    | ✓     | ✓       | ✓      |
| Delete Test Cases         | ✓     | ✓       | ✗      |
| Execute Test Cases        | ✓     | ✓       | ✓      |
| Manage Users              | ✓     | ✗       | ✗      |
| Create Users              | ✓     | ✗       | ✗      |
| Assign Roles              | ✓     | ✗       | ✗      |

---

## Tech Stack

**Frontend:** React 18, React Router 6, Tailwind CSS, Recharts, Axios

**Backend:** Node.js, Express.js, Mongoose, JWT, bcryptjs

**Database:** MongoDB (5 collections: Users, Bugs, TestCases, TestSuites, Activities)

---

## Troubleshooting

**MongoDB not connecting?**
- Make sure MongoDB is running: `mongod` or start MongoDB service
- Check `MONGODB_URI` in `backend/.env`

**Port already in use?**
- Change `PORT` in `backend/.env`
- Frontend port: set `PORT=3001` before `npm start`

**Seed fails?**
- Make sure MongoDB is running before running `npm run seed`