const bcrypt = require('bcryptjs');
const crypto = require('node:crypto');
const db = require('./db');

function seedDemoData() {
  console.log('Seeding initial demo data...');

  const demoEmail = 'tanay@example.com';
  let user = db.prepare('SELECT id FROM users WHERE email = ?').get(demoEmail);

  let userId;
  if (!user) {
    userId = 'demo-user-001';
    const salt = bcrypt.genSaltSync(10);
    const passwordHash = bcrypt.hashSync('password123', salt);
    db.prepare(`
      INSERT INTO users (id, first_name, last_name, email, password_hash)
      VALUES (?, ?, ?, ?, ?)
    `).run(userId, 'Tanay', 'Pratap', demoEmail, passwordHash);
    console.log('Created demo user:', demoEmail);
  } else {
    userId = user.id;
  }

  // Ensure default labels
  const labels = [
    { id: 'label-health', name: 'Health', color: '#10B981' },
    { id: 'label-study', name: 'Study', color: '#3B82F6' },
    { id: 'label-work', name: 'Work', color: '#8B5CF6' },
    { id: 'label-personal', name: 'Personal', color: '#EC4899' }
  ];

  const insertLabel = db.prepare('INSERT OR IGNORE INTO labels (id, user_id, name, color) VALUES (?, ?, ?, ?)');
  labels.forEach(l => insertLabel.run(l.id, userId, l.name, l.color));

  // Check existing habits for this user
  const habitCount = db.prepare('SELECT COUNT(*) AS count FROM habits WHERE user_id = ?').get(userId).count;
  if (habitCount === 0) {
    const today = new Date();
    const dateStr = (d) => {
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    const todayStr = dateStr(today);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = dateStr(yesterday);
    const dayBefore = new Date(today);
    dayBefore.setDate(dayBefore.getDate() - 2);
    const dayBeforeStr = dateStr(dayBefore);

    const demoHabits = [
      {
        id: 'habit-001',
        name: 'Task #1 - Read 20 mins',
        description: 'Read book or industry articles',
        frequency: 'DAILY',
        goal: 2,
        color: 'blue',
        labels: ['label-study']
      },
      {
        id: 'habit-002',
        name: 'Task #2 - Drink 3L Water',
        description: 'Hydrate well throughout the day',
        frequency: 'DAILY',
        goal: 3,
        color: 'pink',
        labels: ['label-health']
      },
      {
        id: 'habit-003',
        name: 'Task #3 - 30 min Jog',
        description: 'Morning or evening cardio run',
        frequency: 'DAILY',
        goal: 1,
        color: 'yellow',
        labels: ['label-health', 'label-personal']
      },
      {
        id: 'habit-004',
        name: 'Task #4 - Code Practice',
        description: 'Solve one algorithm problem or build project',
        frequency: 'DAILY',
        goal: 1,
        color: 'green',
        labels: ['label-work']
      },
      {
        id: 'habit-005',
        name: 'Task #12 - Meditate',
        description: '10 minutes mindful breathing',
        frequency: 'DAILY',
        goal: 2,
        color: 'pink',
        labels: ['label-health']
      }
    ];

    const insertHabit = db.prepare(`
      INSERT INTO habits (id, user_id, name, description, start_date, frequency, goal, color, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'active')
    `);
    const insertHabitLabel = db.prepare('INSERT OR IGNORE INTO habit_labels (habit_id, label_id) VALUES (?, ?)');

    for (const h of demoHabits) {
      insertHabit.run(h.id, userId, h.name, h.description, '2026-10-01', h.frequency, h.goal, h.color);
      for (const lId of h.labels) {
        insertHabitLabel.run(h.id, lId);
      }
    }

    // Insert completions for demo habits
    const insertComp = db.prepare('INSERT OR IGNORE INTO completions (id, habit_id, date, count) VALUES (?, ?, ?, ?)');
    // Complete Task #12 today
    insertComp.run(crypto.randomUUID(), 'habit-005', todayStr, 2);
    // Partial completion for Task #2 today
    insertComp.run(crypto.randomUUID(), 'habit-002', todayStr, 1);
    // Historical completions to demonstrate streak
    insertComp.run(crypto.randomUUID(), 'habit-001', yesterdayStr, 2);
    insertComp.run(crypto.randomUUID(), 'habit-002', yesterdayStr, 3);
    insertComp.run(crypto.randomUUID(), 'habit-003', yesterdayStr, 1);
    insertComp.run(crypto.randomUUID(), 'habit-001', dayBeforeStr, 2);
    insertComp.run(crypto.randomUUID(), 'habit-004', dayBeforeStr, 1);

    console.log('Seeded demo habits and completions successfully!');
  }
}

if (require.main === module) {
  seedDemoData();
}

module.exports = seedDemoData;

