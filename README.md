# 🎯 Habit Tracker — Full-Stack Application

A modern, responsive, full-stack habit tracking web application designed and built according to the Figma design specification. The application provides an intuitive workflow for building consistent routines, tracking daily completions, visualizing progress through interactive calendar histories, organizing habits with custom labels, and generating actionable productivity metrics.

---

## 📑 Table of Contents

- [Overview & Key Features](#-overview--key-features)
- [System Architecture & Tech Stack](#-system-architecture--tech-stack)
- [Database Schema & Data Integrity](#-database-schema--data-integrity)
- [Getting Started & Local Setup](#-getting-started--local-setup)
- [Application User Guide](#-application-user-guide)
- [REST API Reference & Curl Examples](#-rest-api-reference--curl-examples)
- [Automated Testing Suite](#-automated-testing-suite)
- [Configuration & Environment Variables](#-configuration--environment-variables)
- [Engineering Decisions & Assumptions](#-engineering-decisions--assumptions)

---

## 🌟 Overview & Key Features

### 1. Authentication & Security
- **Registration & Login**: Secure account creation with First Name, Last Name, Email, and Password.
- **Credential Protection**: Passwords are cryptographically salted and hashed using `bcryptjs` (10 rounds). Passwords are never stored in plain text.
- **Session Management**: Stateless JWT-based authentication with expiration controls. Logout immediately invalidates local credentials.
- **Strict Data Isolation**: Server-level ownership verification ensures users can only read, modify, or delete their own habits and records.
- **One-Click Demo Access**: Fast testing login button pre-configured with a seeded demo user (`tanay@example.com` / `password123`).

### 2. Habit Lifecycle Management
- **Creation Workflow**: Create habits with a title, optional description, start date, optional end date, frequency (`DAILY`, `WEEKLY`, `MONTHLY`), daily target goal counter (e.g. 1 time, 2 times), custom pastel color theme (Blue, Pink, Yellow, Green, Purple), and label tags.
- **Categorization**: Habits are categorized dynamically into **Active** and **Completed** sections on the home dashboard.
- **Non-Destructive Editing**: Update habit details, goal targets, frequencies, colors, and labels without altering or wiping historical completion records.
- **Archiving System**: Pause habits away from the active dashboard while preserving historical completion data for future review.
- **Soft Deletion & Trash**: Move deleted habits into a Trash repository with the ability to restore them or execute a permanent deletion.

### 3. Completion Tracking & Analytics
- **One-Tap Completion**: Interactive circular checkmark toggles habit completion for the date with a confetti reward effect.
- **Zero-Duplicate Guarantee**: Enforced at both the SQLite database schema layer (`UNIQUE(habit_id, date)`) and the API layer via idempotent upsert operations.
- **Interactive Calendar View**: Month-grid calendar displaying completion history with the ability to click any past date to retroactively log or undo completions.
- **Live Dashboard Metrics**:
  - **Completed**: Habits finished today.
  - **In Progress**: Habits partially finished today (e.g., 1 of 2 times).
  - **Overdue**: Active habits not yet completed today.
  - **Total**: Total count of active habits.
- **Streak Calculation**: Continuous consecutive-day streak calculation based on user completion logs.
- **Productivity & Mood Scores**: Composite habit score (0–100) reflecting daily goal completion, 7-day consistency, and streaks.

### 4. Extensions & Productivity Utilities
- **Label Organization**: Dedicated labels view to create, update, search, and delete custom tags with habit count badges.
- **Daily Motivation**: Curated daily quote section featuring inspirational thoughts and authors.
- **CSV Data Export**: One-click download exporting all user habits, goals, frequencies, and completion timestamps as a `.csv` spreadsheet.
- **Responsive Layout**: Seamless viewport adaptation across mobile phones, tablets, and desktop monitors (featuring an adaptive mobile topbar, sliding drawer, and bottom navigation bar).

---

## 🏗 System Architecture & Tech Stack

```
habit-tracker-take-home/
├── backend/                         # Node.js Express API Server
│   ├── src/
│   │   ├── app.js                   # Express application setup & middleware routing
│   │   ├── server.js                # Server entry point (Default: port 5001)
│   │   ├── db.js                    # SQLite database connection & migrations
│   │   ├── seed.js                  # Automated initial demo data seeder
│   │   ├── middleware/
│   │   │   └── auth.js              # JWT validation & user attachment middleware
│   │   ├── utils/
│   │   │   └── errors.js            # Standardized error payload formatting
│   │   └── routes/
│   │       ├── auth.js              # Authentication endpoints (/api/auth)
│   │       ├── habits.js            # Habit CRUD & archive/trash (/api/habits)
│   │       ├── completions.js       # Habit completion records (/api/habits/:id/completions)
│   │       ├── dashboard.js         # Dynamic analytics & streaks (/api/dashboard/stats)
│   │       ├── labels.js            # Label tag management (/api/labels)
│   │       ├── quotes.js            # Daily quotes (/api/quotes/daily)
│   │       └── export.js            # CSV data export (/api/export/csv)
│   ├── test/
│   │   └── api.test.js              # Automated Node test runner integration tests
│   └── package.json
├── frontend/                        # React 18 Single-Page Application (Vite)
│   ├── src/
│   │   ├── assets/
│   │   │   └── login.json           # Vector climber character Lottie animation
│   │   ├── api/
│   │   │   └── client.js            # Centralized API service layer with auth headers
│   │   ├── context/
│   │   │   └── AuthContext.jsx      # Authentication & user state provider
│   │   ├── components/
│   │   │   ├── Sidebar.jsx          # Desktop persistent sidebar & mobile drawer
│   │   │   ├── HabitCard.jsx        # Pastel cards with checkmark & progress counters
│   │   │   ├── NewHabitModal.jsx    # Create habit modal matching Figma design
│   │   │   └── HabitDetailModal.jsx # Read/edit modal with interactive month calendar
│   │   ├── pages/
│   │   │   ├── LandingPage.jsx      # Hero landing screen with Lottie animation
│   │   │   ├── HomePage.jsx         # Main dashboard with stat cards & habit lists
│   │   │   ├── LabelsPage.jsx       # Label management & filtering interface
│   │   │   ├── ArchivePage.jsx      # Paused habit archive interface
│   │   │   ├── TrashPage.jsx        # Trashed habits with restore & delete
│   │   │   └── ProfilePage.jsx      # Streaks, scores, quotes, and CSV export
│   │   ├── utils/
│   │   │   └── helpers.js           # Date formatters and pastel color maps
│   │   ├── App.jsx                  # Main application router and modal coordinator
│   │   ├── main.jsx                 # React root DOM mount
│   │   └── index.css                # Tailwind base styles and custom scrollbars
│   ├── vite.config.js               # Vite bundler configuration & /api proxy
│   ├── tailwind.config.js           # Customized Figma color design tokens
│   └── package.json
└── package.json                     # Root convenience scripts
```

### Technology Highlights

- **Backend**: Node.js (v18+), Express 4, native `node:sqlite`, `jsonwebtoken`, `bcryptjs`, `cors`, `dotenv`.
- **Frontend**: React 18, Vite 6, Tailwind CSS 3, `lottie-web`, `lucide-react`, `canvas-confetti`.
- **Testing**: Native Node Test Runner (`node:test`, `node:assert/strict`) with zero external testing dependencies.

---

## 🗄 Database Schema & Data Integrity

The application utilizes native SQLite via Node's built-in `node:sqlite`. Foreign key constraints and unique composite indexes are enforced at the database engine level.

```sql
-- Users Table
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TEXT DEFAULT (datetime('now'))
);

-- Habits Table
CREATE TABLE IF NOT EXISTS habits (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  start_date TEXT NOT NULL,
  end_date TEXT,
  frequency TEXT DEFAULT 'DAILY',
  goal INTEGER DEFAULT 1,
  color TEXT DEFAULT 'blue',
  status TEXT DEFAULT 'active', -- 'active', 'archived', 'trashed'
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

-- Labels Table
CREATE TABLE IF NOT EXISTS labels (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  color TEXT DEFAULT '#5B4DFC',
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

-- Habit Labels (Many-to-Many Relationship)
CREATE TABLE IF NOT EXISTS habit_labels (
  habit_id TEXT NOT NULL,
  label_id TEXT NOT NULL,
  PRIMARY KEY (habit_id, label_id),
  FOREIGN KEY (habit_id) REFERENCES habits (id) ON DELETE CASCADE,
  FOREIGN KEY (label_id) REFERENCES labels (id) ON DELETE CASCADE
);

-- Completions Table (Enforces unique completion per habit per calendar day)
CREATE TABLE IF NOT EXISTS completions (
  id TEXT PRIMARY KEY,
  habit_id TEXT NOT NULL,
  date TEXT NOT NULL, -- 'YYYY-MM-DD'
  count INTEGER DEFAULT 1,
  created_at TEXT DEFAULT (datetime('now')),
  UNIQUE (habit_id, date),
  FOREIGN KEY (habit_id) REFERENCES habits (id) ON DELETE CASCADE
);
```

---

## 🚀 Getting Started & Local Setup

### Prerequisites
- **Node.js**: Version 18.0.0 or higher (v20+ recommended).
- **npm**: Version 9.0.0 or higher.

### Step 1: Install Dependencies

From the repository root, install packages for both backend and frontend:

```bash
# 1. Install backend dependencies
cd backend
npm install

# 2. Install frontend dependencies
cd ../frontend
npm install
```

### Step 2: Start the Backend API Server

```bash
cd backend
npm start
```
The backend starts on `http://localhost:5001`. On initial startup, the database automatically seeds demo data with sample habits and user credentials.

### Step 3: Start the Frontend Application

Open a second terminal window:

```bash
cd frontend
npm run dev
```
The frontend Vite server will be available at `http://localhost:3000` (or `http://localhost:5173`).

---

## 💻 Application User Guide

### 1. Logging In or Testing with Demo Account
- **Option A (One-Click Demo)**: Click **"Demo One-Click"** on the landing page. This logs you straight into Tanay Pratap's pre-configured dashboard with sample habits and completion records.
- **Option B (New Account)**: Click **"Already have an account?"** to open the Sign-Up modal, fill in your details, and click **"Create Free Account"**.
- **Option C (Existing Account)**: Click **"Join Now"** to open the Sign-In modal and enter your email and password.

### 2. Managing Habits
- **Create a Habit**: Click the purple **"+ Create New Habit"** button in the sidebar (or top bar on mobile). Fill in the habit name, description, start date, target frequency, daily goal count, color theme, and tags. Click **"Done"**.
- **Log Daily Completion**: On any habit card, click the circular checkmark. The checkmark turns solid with a confetti burst, updates your progress counter (e.g., `1/1 times today`), and increments the **Completed** metric card.
- **Undo Completion**: Click the circular checkmark again to toggle the status back to incomplete.

### 3. Inspecting & Editing in the Detail Modal
- Click anywhere on a habit card to open the **Habit Detail Modal**.
- **Month Calendar History**: Review past completions marked as purple dots. Click any date on the calendar to log or undo a completion retroactively.
- **Edit Mode**: Click the pencil icon to update title, dates, goals, frequency, color, or labels. Click **"Done"** to save changes without affecting past completion records.
- **Archive / Trash**: Click the Archive icon to pause the habit, or the Trash icon to move it to trash.

### 4. Organizing with Labels
- Click **"Labels"** in the sidebar.
- Search through your tags, create new categories with custom color badges, edit names in place, or delete unused tags.

### 5. Reviewing the Profile & Analytics
- Click **"View Profile"** in the lower-left corner of the sidebar.
- Review your **Current Streak 🔥**, **Habit Score 🎯**, and interactive **Mood Score**.
- Read the daily inspirational quote.
- Click **"Export Habits to CSV"** to download a spreadsheet of your habit logs.

---

## 📡 REST API Reference & Curl Examples

All private endpoints require the JWT token returned upon login or signup passed via the standard `Authorization: Bearer <TOKEN>` header.

### 1. Authentication Endpoints

#### Register a New User
```bash
curl -X POST http://localhost:5001/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Tanay",
    "lastName": "Pratap",
    "email": "tanay@example.com",
    "password": "password123"
  }'
```

#### Log In
```bash
curl -X POST http://localhost:5001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "tanay@example.com",
    "password": "password123"
  }'
```

---

### 2. Habit Management Endpoints

#### List Habits (`active`, `archived`, or `trashed`)
```bash
curl -X GET "http://localhost:5001/api/habits?status=active" \
  -H "Authorization: Bearer <TOKEN>"
```

#### Create a Habit
```bash
curl -X POST http://localhost:5001/api/habits \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <TOKEN>" \
  -d '{
    "name": "Morning Meditation",
    "description": "10 minutes of mindfulness",
    "startDate": "2026-10-30",
    "frequency": "DAILY",
    "goal": 1,
    "color": "purple"
  }'
```

#### Update a Habit (History Preserved)
```bash
curl -X PATCH http://localhost:5001/api/habits/<HABIT_ID> \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <TOKEN>" \
  -d '{
    "name": "Morning Meditation & Breathing",
    "goal": 2
  }'
```

#### Archive a Habit
```bash
curl -X POST http://localhost:5001/api/habits/<HABIT_ID>/archive \
  -H "Authorization: Bearer <TOKEN>"
```

#### Soft Delete (Move to Trash)
```bash
curl -X DELETE http://localhost:5001/api/habits/<HABIT_ID> \
  -H "Authorization: Bearer <TOKEN>"
```

---

### 3. Completion Tracking Endpoints

#### Mark Habit Completed for Date (Idempotent Upsert)
```bash
curl -X PUT http://localhost:5001/api/habits/<HABIT_ID>/completions/2026-10-30 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <TOKEN>" \
  -d '{ "count": 1 }'
```

#### Undo Habit Completion for Date
```bash
curl -X DELETE http://localhost:5001/api/habits/<HABIT_ID>/completions/2026-10-30 \
  -H "Authorization: Bearer <TOKEN>"
```

#### Query Completion Records in Date Range
```bash
curl -X GET "http://localhost:5001/api/habits/<HABIT_ID>/completions?from=2026-10-01&to=2026-10-31" \
  -H "Authorization: Bearer <TOKEN>"
```

---

### 4. Analytics, Labels & Export Endpoints

#### Get Live Dashboard Statistics & Streaks
```bash
curl -X GET "http://localhost:5001/api/dashboard/stats?date=2026-10-30" \
  -H "Authorization: Bearer <TOKEN>"
```

#### Export All Habits to CSV
```bash
curl -X GET http://localhost:5001/api/export/csv \
  -H "Authorization: Bearer <TOKEN>" \
  -o habits_export.csv
```

---

## 🧪 Automated Testing Suite

The backend includes automated integration tests using the native Node.js Test Runner. The test suite spins up an ephemeral HTTP server on a random open port, creates an isolated test database, runs full integration assertions, and cleans up artifacts automatically upon completion.

### Test Coverage Areas:
1. **Authentication Flow**: Validates required payload fields, rejection of malformed emails, password hashing verification, duplicate email conflict errors (`409`), invalid password rejections (`401`), and session token validation.
2. **Habit Lifecycle & Cross-User Security**: Validates habit creation, ensures User B receives a `404 Not Found` when attempting to access or modify User A's habit, and tests archive/unarchive status transitions.
3. **Completion Tracking & Duplicate Prevention**: Validates that marking the same habit and date multiple times never creates duplicate records in SQLite, confirms that modifying habit metadata preserves historical logs, and verifies that dashboard metrics update dynamically.

### Run Tests:

```bash
cd backend
npm test
```

Expected output:
```text
✔ Auth flow: Signup, Login, and Auth Verification
✔ Habit Management and Ownership Enforcement
✔ Completion Tracking and Duplicate Prevention
ℹ tests 3
ℹ suites 0
ℹ pass 3
ℹ fail 0
```

---

## ⚙️ Configuration & Environment Variables

The project functions with zero initial configuration. Optional overrides can be provided in `backend/.env`:

| Variable | Default Value | Description |
|---|---|---|
| `PORT` | `5001` | Port on which the Express API server listens |
| `JWT_SECRET` | `habit-tracker-dev-secret-key-2026` | Secret key used to sign and verify JWT authentication tokens |
| `DATABASE_PATH` | `backend/data/habit_tracker.db` | Relative or absolute path to the SQLite database file |

---

## 💡 Engineering Decisions & Assumptions

1. **Embedded SQLite with Zero Native Build Headaches**: Rather than requiring external service installations (e.g. Postgres or Docker containers) or native C++ compiled SQLite bindings that break across architectures, the backend uses Node.js's native `node:sqlite`. It is fast, transactional, and runs out of the box on macOS, Linux, and Windows.
2. **Calendar Date vs. Timestamp Formatting**: Habit completions are bound to ISO calendar dates (`YYYY-MM-DD`) rather than UTC timestamps. This prevents time-zone shifts across midnight from inadvertently altering the recorded completion day.
3. **Weekly Completion Rate Formula**: For standard 7-day intervals, the completion rate denominator is defined as `Total Active Habits * 7 days`, with actual completions within the window serving as the numerator.
4. **Idempotent Completion Upserts**: The completion endpoints utilize SQLite's `UNIQUE(habit_id, date)` index and `INSERT OR REPLACE` mechanics, guaranteeing that rapid double-clicks on the checkmark button cannot create duplicate rows.
5. **Mobile-First Responsive Adaptation**: The desktop UI layout features a 240px persistent sidebar. On viewports below 768px, navigation seamlessly transitions into a mobile header with a slide-over drawer and bottom navigation bar, ensuring one-hand usability on mobile devices.
