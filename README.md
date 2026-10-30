# 🎯 Habit Tracker

A responsive, full-stack habit tracking web application built with Node.js, Express, SQLite, and React. Designed to help users build consistent routines, log daily completions, track streaks, and visualize progress.

---

## ⚡ Quick Start

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher

### 1. Start the Backend
```bash
cd backend
npm install
npm start
```
The API server runs at **http://localhost:5001**. A seeded SQLite database with demo data is initialized automatically.

### 2. Start the Frontend
In a separate terminal window:
```bash
cd frontend
npm install
npm run dev
```
The application will be available at **http://localhost:3000**.

---

## 🔑 Demo Account

For quick evaluation without signing up, click **"Demo One-Click"** on the landing page, or log in with:

| Email | Password |
|---|---|
| `tanay@example.com` | `password123` |

---

## ✨ Features

- **Authentication**: Secure JWT-based registration and login with bcrypt password hashing.
- **Habit Lifecycle**: Create, edit, archive, and soft-delete habits with frequencies (Daily, Weekly, Monthly), custom goal counts, and color themes.
- **Completion Tracking**: One-tap checkmark logging with celebration confetti. Idempotent upserts prevent duplicate records.
- **History & Calendar**: Interactive monthly completion calendar with retroactive completion toggles.
- **Dashboard & Streaks**: Real-time counts for Completed, In Progress, Overdue, and Total habits, along with consecutive day streak calculation.
- **Labels & Tags**: Organize habits with custom color-coded labels.
- **Daily Inspiration & Export**: Curated daily motivational quotes and one-click CSV export of all habit data.
- **Responsive Design**: Mobile-friendly layout with drawer and bottom navigation bar, plus smooth Lottie character animation on the landing page.

---

## 🛠 Tech Stack

- **Backend**: Node.js, Express 4, native `node:sqlite`, JWT (`jsonwebtoken`), `bcryptjs`, CORS
- **Frontend**: React 18, Vite, Tailwind CSS, Lucide Icons, `lottie-web`, `canvas-confetti`
- **Database**: SQLite (Node's built-in `node:sqlite` — zero external DB setup required)
- **Testing**: Node.js native test runner (`node:test`, `node:assert/strict`)

---

## 🧪 Running Tests

The backend includes automated integration tests covering authentication, habit ownership isolation, and duplicate-proof completion tracking.

```bash
cd backend
npm test
```

Expected output:
```text
✔ Auth flow: Signup, Login, and Auth Verification
✔ Habit Management and Ownership Enforcement
✔ Completion Tracking and Duplicate Prevention
ℹ pass 3
ℹ fail 0
```

---

## 📡 API Overview

Base URL: `http://localhost:5001/api`

| Method | Endpoint | Description | Auth Required |
|---|---|---|:---:|
| `POST` | `/auth/signup` | Register a new user | No |
| `POST` | `/auth/login` | Authenticate and receive JWT | No |
| `GET` | `/auth/me` | Fetch current user profile | Yes |
| `GET` | `/habits` | List habits (`?status=active\|archived\|trashed`) | Yes |
| `POST` | `/habits` | Create a new habit | Yes |
| `PATCH` | `/habits/:id` | Update habit (preserves completion history) | Yes |
| `DELETE` | `/habits/:id` | Move habit to trash | Yes |
| `POST` | `/habits/:id/archive` | Archive or unarchive a habit | Yes |
| `PUT` | `/habits/:id/completions/:date` | Log completion for date (`YYYY-MM-DD`) | Yes |
| `DELETE` | `/habits/:id/completions/:date` | Undo completion for date | Yes |
| `GET` | `/habits/:id/completions` | Get completions for date range | Yes |
| `GET` | `/dashboard/stats` | Get metrics, streak, and progress summary | Yes |
| `GET` | `/labels` | List all user labels | Yes |
| `POST` | `/labels` | Create a label | Yes |
| `GET` | `/quotes/daily` | Get daily inspirational quote | No |
| `GET` | `/export/csv` | Download habit history as CSV | Yes |

*Private endpoints require the `Authorization: Bearer <TOKEN>` header.*

---

## ⚙️ Environment Variables

Zero configuration is required out-of-the-box. Optional overrides can be placed in `backend/.env`:

| Variable | Default | Description |
|---|---|---|
| `PORT` | `5001` | Express server port |
| `JWT_SECRET` | `habit-tracker-dev-secret-key-2026` | Secret key for JWT signing |
| `DATABASE_PATH` | `backend/data/habit_tracker.db` | Path to SQLite database file |

---

## 📁 Project Structure

```
habit_tracker/
├── backend/
│   ├── src/
│   │   ├── app.js            # Express app configuration & middleware
│   │   ├── server.js         # Server entry point (port 5001)
│   │   ├── db.js             # SQLite schema & database connection
│   │   ├── seed.js           # Initial demo data seeder
│   │   ├── middleware/       # JWT authentication middleware
│   │   └── routes/           # Auth, habits, completions, dashboard, export
│   └── test/
│       └── api.test.js       # Integration test suite
├── frontend/
│   ├── src/
│   │   ├── api/client.js     # Centralized API service
│   │   ├── context/          # Auth context provider
│   │   ├── components/       # Sidebar, habit cards, modals
│   │   └── pages/            # Landing, Dashboard, Labels, Archive, Profile
│   └── vite.config.js
└── README.md
```


