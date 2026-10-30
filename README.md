# Habit Tracker — Full-Stack Application

**Track:** **Full-stack** (Node.js Express backend + React Vite frontend)  
**Design Reference:** [Figma Design Reference](https://www.figma.com/file/37Ky6s3RjFkuEwUnzhdtxI/Habit-Tracker-App?node-id=0%3A1)  
**Database:** SQLite via native `node:sqlite` (zero external C++ compilation dependencies)

A modern, responsive full-stack Habit Tracker faithfully styled after the provided Figma designs. It includes authentication, habit lifecycle management, streak and completion tracking, calendar history views, labels organization, archive and trash support, dynamic analytics, and Lottie animations.

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
- **Period Filter:** Dropdown to select tracking timeframe (`Today`, `This Week`, `This Month`, `All Time`).
- **Calculated Statistics:** All counts and percentages are derived directly from SQLite completion records.

### 5. Profile & Optional Extensions (P1)
- **Streak Calculation:** Dynamic consecutive-day streak calculation based on user completion dates.
- **Habit Score:** Composite score (0-100) combining daily progress (40%), 7-day consistency (40%), and streaks (20%).
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
│   │   ├── assets/
│   │   │   └── login.json       # Lottie animation asset
│   │   ├── api/
│   │   │   └── client.js        # API service layer with auth headers
│   │   ├── context/
│   │   │   └── AuthContext.jsx  # React Context for session management
│   │   ├── components/
│   │   │   ├── Sidebar.jsx      # Navigation sidebar (desktop & mobile drawer)
│   │   │   ├── HabitCard.jsx    # Pastel cards matching Figma
│   │   │   ├── NewHabitModal.jsx# Create habit modal matching Figma
│   │   │   └── HabitDetailModal.jsx # Read/edit modal & calendar history
│   │   ├── pages/
│   │   │   ├── LandingPage.jsx  # Hero page with Lottie character & auth modal
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

## ⚙️ Environment Variables

The project has zero-configuration defaults and runs out of the box. You can optionally customize environment variables in `backend/.env`:

| Variable | Default Value | Description |
|---|---|---|
| `PORT` | `5001` | Port on which Express API server listens |
| `JWT_SECRET` | `habit-tracker-dev-secret-key-2026` | Secret key used to sign and verify JSON Web Tokens |
| `DATABASE_PATH` | `backend/data/habit_tracker.db` | Absolute or relative file path to the SQLite database |

---

## 🚀 Setup & Running Locally

### Prerequisites
- Node.js v18+ (Node v20 or v22+ recommended; uses native `node:sqlite`)
- npm v9+

### 1. Install Dependencies

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
The frontend application runs on `http://localhost:3000`.

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

## 📡 Example API Requests (`curl`)

### 1. User Signup
```bash
curl -X POST http://localhost:5001/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"firstName":"Tanay","lastName":"Pratap","email":"tanay@example.com","password":"password123"}'
```

### 2. User Login
```bash
curl -X POST http://localhost:5001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"tanay@example.com","password":"password123"}'
```

### 3. Create Habit (Authenticated)
```bash
curl -X POST http://localhost:5001/api/habits \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <YOUR_JWT_TOKEN>" \
  -d '{"name":"Morning Meditation","goal":1,"frequency":"DAILY","color":"purple"}'
```

### 4. Mark Habit Completed for Date (Idempotent / No Duplicates)
```bash
curl -X PUT http://localhost:5001/api/habits/<HABIT_ID>/completions/2026-10-30 \
  -H "Authorization: Bearer <YOUR_JWT_TOKEN>"
```

### 5. Fetch Dynamic Dashboard Statistics
```bash
curl -X GET "http://localhost:5001/api/dashboard/stats?date=2026-10-30" \
  -H "Authorization: Bearer <YOUR_JWT_TOKEN>"
```

### 6. Export Habits to CSV
```bash
curl -X GET http://localhost:5001/api/export/csv \
  -H "Authorization: Bearer <YOUR_JWT_TOKEN>" -o habits_export.csv
```

---

## 💡 Assumptions and Known Limitations

1. **Date Format:** Calendar dates are consistently stored in ISO `YYYY-MM-DD` string format rather than UTC timestamps to prevent timezone shift issues across midnight.
2. **Completion Rate Denominator:** For a 7-day period, the completion rate denominator is defined as `(Total Active Habits * 7 days)`, against which actual completions in the window are calculated.
3. **Database Architecture:** SQLite was chosen via Node's native `node:sqlite` so that evaluators can clone and run the repository immediately without configuring PostgreSQL/MySQL services or dealing with native C++ compilation errors.
4. **Offline Sync:** While changes persist to SQLite, offline queueing when disconnected is outside the assignment scope.

---

## 📋 Acceptance Checklist Verification

- [x] **Track identified:** Full-stack track implemented end-to-end.
- [x] **Input validation & error states:** Present on all endpoints and frontend forms.
- [x] **Ownership enforcement:** Server checks `user_id` on all habit, completion, and label queries.
- [x] **Duplicate prevention:** Database-level `UNIQUE(habit_id, date)` constraint prevents duplicate records.
- [x] **History preservation:** Updating a habit does not delete completion rows.
- [x] **Dynamic statistics:** Summary cards, streak, and completion rate are calculated from actual data.
- [x] **Calendar view:** Interactive month completion history view.
- [x] **Responsive UI:** Fully responsive across mobile, tablet, and desktop viewports.
- [x] **Automated tests:** Integration test suite passing cleanly.
- [x] **Documentation:** Setup, tests, environment variables, assumptions, limitations, and example requests included.
