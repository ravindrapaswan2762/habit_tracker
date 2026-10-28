const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const fs = require('node:fs');

// Set test database path before loading app
const testDbPath = path.join(__dirname, '..', 'data', 'test_habit_tracker.db');
if (fs.existsSync(testDbPath)) {
  fs.unlinkSync(testDbPath);
}
process.env.DATABASE_PATH = testDbPath;
process.env.JWT_SECRET = 'test-secret';

const app = require('../src/app');

// Helper to start ephemeral server for testing with native fetch
let server;
let baseUrl;

test.before(async () => {
  await new Promise((resolve) => {
    server = app.listen(0, () => {
      const port = server.address().port;
      baseUrl = `http://localhost:${port}/api`;
      resolve();
    });
  });
});

test.after(async () => {
  await new Promise((resolve) => {
    server.close(() => {
      if (fs.existsSync(testDbPath)) {
        try { fs.unlinkSync(testDbPath); } catch (e) {}
      }
      resolve();
    });
  });
});

async function api(endpoint, options = {}) {
  const url = `${baseUrl}${endpoint}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    }
  });
  const data = await res.json().catch(() => null);
  return { status: res.status, data };
}

test('Auth flow: Signup, Login, and Auth Verification', async (t) => {
  // Test signup validation
  const emptySignup = await api('/auth/signup', {
    method: 'POST',
    body: JSON.stringify({})
  });
  assert.equal(emptySignup.status, 400);
  assert.equal(emptySignup.data.error.code, 'VALIDATION_ERROR');

  // Test successful signup
  const signup = await api('/auth/signup', {
    method: 'POST',
    body: JSON.stringify({
      firstName: 'Tanay',
      lastName: 'Pratap',
      email: 'tanay@example.com',
      password: 'password123'
    })
  });
  assert.equal(signup.status, 201);
  assert.ok(signup.data.token);
  assert.equal(signup.data.user.email, 'tanay@example.com');

  const token = signup.data.token;

  // Duplicate signup fails
  const dupSignup = await api('/auth/signup', {
    method: 'POST',
    body: JSON.stringify({
      firstName: 'Tanay',
      lastName: 'Pratap',
      email: 'tanay@example.com',
      password: 'password123'
    })
  });
  assert.equal(dupSignup.status, 409);

  // Login with invalid password
  const badLogin = await api('/auth/login', {
    method: 'POST',
    body: JSON.stringify({
      email: 'tanay@example.com',
      password: 'wrongpassword'
    })
  });
  assert.equal(badLogin.status, 401);

  // Login with correct credentials
  const login = await api('/auth/login', {
    method: 'POST',
    body: JSON.stringify({
      email: 'tanay@example.com',
      password: 'password123'
    })
  });
  assert.equal(login.status, 200);
  assert.ok(login.data.token);

  // Protected route /auth/me
  const me = await api('/auth/me', {
    headers: { Authorization: `Bearer ${token}` }
  });
  assert.equal(me.status, 200);
  assert.equal(me.data.user.firstName, 'Tanay');
});

test('Habit Management and Ownership Enforcement', async (t) => {
  // Create User 1
  const u1 = await api('/auth/signup', {
    method: 'POST',
    body: JSON.stringify({
      firstName: 'User',
      lastName: 'One',
      email: 'user1@test.com',
      password: 'password123'
    })
  });
  const token1 = u1.data.token;

  // Create User 2
  const u2 = await api('/auth/signup', {
    method: 'POST',
    body: JSON.stringify({
      firstName: 'User',
      lastName: 'Two',
      email: 'user2@test.com',
      password: 'password123'
    })
  });
  const token2 = u2.data.token;

  // User 1 creates habit
  const createHabit = await api('/habits', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token1}` },
    body: JSON.stringify({
      name: 'Morning Jog',
      description: 'Run 5km every morning',
      startDate: '2026-10-01',
      frequency: 'DAILY',
      goal: 1,
      color: 'blue'
    })
  });
  assert.equal(createHabit.status, 201);
  const habitId = createHabit.data.habit.id;
  assert.equal(createHabit.data.habit.name, 'Morning Jog');

  // User 2 cannot access User 1's habit
  const getForbidden = await api(`/habits/${habitId}`, {
    headers: { Authorization: `Bearer ${token2}` }
  });
  assert.equal(getForbidden.status, 404);

  // User 1 updates habit
  const updateHabit = await api(`/habits/${habitId}`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${token1}` },
    body: JSON.stringify({
      name: 'Morning Jog & Stretch',
      goal: 2
    })
  });
  assert.equal(updateHabit.status, 200);
  assert.equal(updateHabit.data.habit.name, 'Morning Jog & Stretch');
  assert.equal(updateHabit.data.habit.goal, 2);

  // Archive habit
  const archive = await api(`/habits/${habitId}/archive`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token1}` }
  });
  assert.equal(archive.status, 200);

  // Active list does not include archived habit
  const activeList = await api('/habits?status=active', {
    headers: { Authorization: `Bearer ${token1}` }
  });
  assert.equal(activeList.data.habits.length, 0);

  // Archived list includes habit
  const archivedList = await api('/habits?status=archived', {
    headers: { Authorization: `Bearer ${token1}` }
  });
  assert.equal(archivedList.data.habits.length, 1);
  assert.equal(archivedList.data.habits[0].id, habitId);

  // Unarchive habit
  const unarchive = await api(`/habits/${habitId}/unarchive`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token1}` }
  });
  assert.equal(unarchive.status, 200);
});

test('Completion Tracking and Duplicate Prevention', async (t) => {
  const u = await api('/auth/signup', {
    method: 'POST',
    body: JSON.stringify({
      firstName: 'Test',
      lastName: 'Runner',
      email: 'tracker@test.com',
      password: 'password123'
    })
  });
  const token = u.data.token;

  const h = await api('/habits', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({
      name: 'Read 20 pages',
      goal: 1,
      color: 'green'
    })
  });
  const habitId = h.data.habit.id;

  // Mark completion for 2026-10-28
  const comp1 = await api(`/habits/${habitId}/completions/2026-10-28`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${token}` }
  });
  assert.equal(comp1.status, 200);
  assert.equal(comp1.data.completion.date, '2026-10-28');

  // Mark same date again - must NOT create duplicate records!
  const comp2 = await api(`/habits/${habitId}/completions/2026-10-28`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${token}` }
  });
  assert.equal(comp2.status, 200);

  // Query completions list - should have exactly 1 record
  const list = await api(`/habits/${habitId}/completions`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  assert.equal(list.data.completions.length, 1);

  // Editing habit does NOT erase history
  await api(`/habits/${habitId}`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({ name: 'Read 30 pages' })
  });

  const listAfterEdit = await api(`/habits/${habitId}/completions`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  assert.equal(listAfterEdit.data.completions.length, 1);

  // Dashboard stats reflect completion
  const stats = await api('/dashboard/stats?date=2026-10-28', {
    headers: { Authorization: `Bearer ${token}` }
  });
  assert.equal(stats.status, 200);
  assert.equal(stats.data.stats.completed, 1);
  assert.equal(stats.data.stats.total, 1);

  // Undo completion
  const undo = await api(`/habits/${habitId}/completions/2026-10-28`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` }
  });
  assert.equal(undo.status, 200);

  // Verify completion removed
  const listAfterUndo = await api(`/habits/${habitId}/completions`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  assert.equal(listAfterUndo.data.completions.length, 0);
});
