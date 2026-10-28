# Habit Tracker — Full-Stack Application

**Track:** **Full-stack** (Node.js Express backend + React Vite frontend)  
**Design Reference:** [Figma Design Reference](https://www.figma.com/file/37Ky6s3RjFkuEwUnzhdtxI/Habit-Tracker-App?node-id=0%3A1)  
**Database:** SQLite via native `node:sqlite` (zero external compilation dependencies)

A modern, responsive full-stack Habit Tracker faithfully styled after the provided Figma designs. It includes authentication, habit lifecycle management, streak and completion tracking, calendar history views, labels organization, archive and trash support, and dynamic analytics.

---

## 🌟 Features Implemented

### 1. Authentication (P0)
- **User Signup & Login:** Sign up with First Name, Last Name, Email, and Password.
- **Input Validation:** Clear validation on email formatting, required fields, and password lengths.
- **Security:** Passwords hashed with `bcryptjs`. Protected routes authenticated with JWT tokens.
- **Ownership Enforcement:** All private endpoints enforce that users can only view, edit, or delete their own habits and records.
- **One-Click Demo Login:** Fast evaluator login pre-populated with Tanay Pratap's profile and initial habits.

### 2. Habit Management (P0)
- **Create Habit:** Name, optional description, start date, optional end date, daily/weekly/monthly frequency, daily goal counter (e.g. 1 time, 2 times), color theme (Blue, Pink, Yellow, Green, Purple), and label tags.
- **List & Grouping:** Grouped into **ACTIVE** and **COMPLETED** sections matching Figma.
- **Edit Habit:** Update name, description, frequency, goal, color, status, and labels without erasing past completions.
- **Archive & Unarchive:** Archive paused habits away from the active dashboard while preserving historical records.
- **Soft Delete & Trash:** Move deleted habits to trash with the ability to restore or permanently delete them.
- **Empty States:** Friendly empty states for Active habits, Archive, and Trash.

### 3. Completion Tracking (P0)
- **Interactive Checkmark Button:** Click the circular checkmark on any habit card to mark or toggle completion for the date.
- **Confetti Celebration:** Rewarding confetti burst on habit completion.
- **Duplicate Prevention:** Enforced via SQLite `UNIQUE(habit_id, date)` constraint and idempotent UPSERT API logic.
- **Calendar Month History:** Interactive month calendar on the habit detail modal to view completions and click any past date to toggle completion.
- **Preserved History:** Editing habit parameters does not alter historical completion logs.

### 4. Dashboard & Analytics (P0)
- **4 Dynamic Summary Cards:**
  - **Completed:** Count of active habits finished today.
  - **In Progress:** Habits partially completed today.
  - **Overdue:** Active habits not yet completed today.
  - **Total:** Total active habits.
- **Period Filter:** Dropdown to select tracking timeframe.
- **Calculated Statistics:** All counts and percentages are derived directly from SQLite completion records.

### 5. Profile & Optional Extensions (P1)
- **Streak Calculation:** Dynamic consecutive-day streak calculation based on user completion dates.
- **Habit Score:** Composite score (0-100) combining daily progress, 7-day consistency, and streaks.
- **Mood Score:** Interactive 1-5 rating check-in.
- **Quote of the Day:** Inspiring quote with decorative quotation marks matching Figma.
- **CSV Data Export:** One-click download of all user habits and completion logs as a `.csv` file.
- **Labels Management:** Dedicated labels view to create, edit, search, and delete custom tags.

---

## 🏗 Project Architecture

```
habit-tracker-take-home/
├── backend/
│   ├── src/
│   │   ├── app.js               # Express application configuration
│   │   ├── server.js            # Server entry point (port 5001)
│   │   ├── db.js                # SQLite initialization and schema migrations
│   │   ├── seed.js              # Initial demo data seeder
│   │   ├── middleware/
│   │   │   └── auth.js          # JWT authentication middleware
│   │   ├── utils/
│   │   │   └── errors.js        # Standardized error responses
│   │   └── routes/
│   │       ├── auth.js          # /api/auth (signup, login, me, logout)
│   │       ├── habits.js        # /api/habits (CRUD, archive, restore)
│   │       ├── completions.js   # /api/habits/:id/completions (GET, PUT, DELETE)
│   │       ├── dashboard.js     # /api/dashboard/stats
│   │       ├── labels.js        # /api/labels
│   │       ├── quotes.js        # /api/quotes/daily
│   │       └── export.js        # /api/export/csv
│   ├── test/
│   │   └── api.test.js          # Automated backend integration tests
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   │   └── client.js        # API service layer with auth headers
│   │   ├── context/
│   │   │   └── AuthContext.jsx  # React Context for session management
│   │   ├── components/
│   │   │   ├── Sidebar.jsx      # Navigation sidebar matching Figma
│   │   │   ├── HabitCard.jsx    # Pastel cards matching Figma
│   │   │   ├── NewHabitModal.jsx# Create habit modal matching Figma
│   │   │   └── HabitDetailModal.jsx # Read/edit modal & calendar history
│   │   ├── pages/
│   │   │   ├── LandingPage.jsx  # Hero page with 3D explorer graphic & auth modal
│   │   │   ├── HomePage.jsx     # Main dashboard with stats & active/completed habits
│   │   │   ├── LabelsPage.jsx   # Labels management view
│   │   │   ├── ArchivePage.jsx  # Archived habits view
│   │   │   ├── TrashPage.jsx    # Trashed habits view
│   │   │   └── ProfilePage.jsx  # Streaks, scores, quote of day, CSV export
│   │   ├── utils/
│   │   │   └── helpers.js       # Date formatting and pastel theme maps
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── vite.config.js           # Proxy configuration to backend:5001
│   ├── tailwind.config.js
│   └── package.json
└── package.json                 # Root convenience scripts
```

---

## 🚀 Setup & Running Locally

### Prerequisites
- Node.js v18+ (Node v20 or v22+ recommended; uses native `node:sqlite`)
- npm v9+

### 1. Install Dependencies

You can install all dependencies from the root directory:
```bash
# Install backend dependencies
cd backend && npm install

# Install frontend dependencies
cd ../frontend && npm install
```

### 2. Seed Initial Demo Data (Optional)

The backend automatically seeds a default demo user and habits on first run, or you can run:
```bash
cd backend && npm run seed
```
**Demo Account Credentials:**
- Email: `tanay@example.com`
- Password: `password123`

### 3. Start the Backend API Server

```bash
cd backend
npm start
```
The backend server runs on `http://localhost:5001`.

### 4. Start the Frontend Development Server

In a separate terminal:
```bash
cd frontend
npm run dev
```
The frontend application runs on `http://localhost:3000` (or `http://localhost:5173`). Open this URL in your browser.

---

## 🧪 Running Automated Tests

The test suite covers:
1. **Authentication:** Signup validation, duplicate email prevention, password hashing, valid/invalid login, and token verification.
2. **Habit Lifecycle & Ownership:** Creation, listing, updating without erasing history, archiving, and ensuring User B cannot read or alter User A's habits.
3. **Completion Tracking & Duplicate Prevention:** Idempotent completion marking, preventing duplicate records on the same date, undoing completions, and verifying dynamic dashboard statistics.

Run tests with:
```bash
cd backend
npm test
```

---

## 📡 API Contract Reference

Base path: `/api`

### Auth Endpoints
- `POST /api/auth/signup` — `{ "firstName": "Tanay", "lastName": "Pratap", "email": "tanay@example.com", "password": "password123" }`
- `POST /api/auth/login` — `{ "email": "tanay@example.com", "password": "password123" }`
- `POST /api/auth/logout` — Logs out and clears session.
- `GET /api/auth/me` — Returns current authenticated user.

### Habit Endpoints
- `GET /api/habits?status=active|archived|trashed` — List habits with labels and completion status.
- `POST /api/habits` — Create habit `{ "name": "Read", "goal": 2, "frequency": "DAILY", "color": "blue" }`
- `GET /api/habits/:id` — Get habit details with completion history.
- `PATCH /api/habits/:id` — Update habit details (preserves completion records).
- `DELETE /api/habits/:id` — Soft-delete habit (or `?permanent=true` for permanent delete).
- `POST /api/habits/:id/archive` — Archive habit.
- `POST /api/habits/:id/unarchive` — Unarchive habit.
- `POST /api/habits/:id/restore` — Restore habit from trash.

### Completion Endpoints
- `GET /api/habits/:id/completions?from=YYYY-MM-DD&to=YYYY-MM-DD` — List completions in date range.
- `PUT /api/habits/:id/completions/:date` — Upsert completion (idempotent, no duplicates).
- `DELETE /api/habits/:id/completions/:date` — Undo completion.

### Dashboard & Analytics Endpoints
- `GET /api/dashboard/stats?date=YYYY-MM-DD` — Dynamic summary of completed, in-progress, overdue, total, streaks, and scores.

### Additional Endpoints
- `GET /api/labels` / `POST /api/labels` / `PATCH /api/labels/:id` / `DELETE /api/labels/:id`
- `GET /api/quotes/daily` — Daily motivational quote.
- `GET /api/export/csv` — Export habits and completions to CSV.

---

## 📋 Acceptance Checklist

- [x] Full-stack track identified and all core requirements working.
- [x] Input validation and useful error messages present on all forms and endpoints.
- [x] User ownership strictly enforced on the server for all habit and completion actions.
- [x] Duplicate completion records for the same habit/date strictly prevented at both the database and API levels.
- [x] Editing habit details does not erase or modify completion history.
- [x] Dashboard statistics and streaks calculated dynamically from real completion data.
- [x] Calendar month view for completion history.
- [x] Automated tests covering auth, habits, completions, and ownership pass.
- [x] Faithful Figma design matching: Landing Page, Home Dashboard, Habit Modals, Labels, Archive, Trash, and Profile.
