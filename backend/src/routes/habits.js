const express = require('express');
const crypto = require('node:crypto');
const db = require('../db');
const { createError } = require('../utils/errors');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();
router.use(requireAuth);

function getTodayString() {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Helper to get labels for a habit
function getHabitLabels(habitId) {
  const stmt = db.prepare(`
    SELECT l.id, l.name, l.color
    FROM labels l
    JOIN habit_labels hl ON hl.label_id = l.id
    WHERE hl.habit_id = ?
  `);
  return stmt.all(habitId);
}

// GET /api/habits
router.get('/', (req, res, next) => {
  try {
    const status = req.query.status || 'active';
    const search = (req.query.search || '').trim().toLowerCase();
    const labelId = req.query.label;
    const targetDate = req.query.date || getTodayString();

    let query = `
      SELECT h.*,
             COALESCE(c.count, 0) AS today_completed_count,
             CASE WHEN c.id IS NOT NULL AND c.count >= h.goal THEN 1 ELSE 0 END AS is_completed_today
      FROM habits h
      LEFT JOIN completions c ON c.habit_id = h.id AND c.date = ?
      WHERE h.user_id = ? AND h.status = ?
    `;
    const params = [targetDate, req.user.id, status];

    if (search) {
      query += ` AND (LOWER(h.name) LIKE ? OR LOWER(COALESCE(h.description, '')) LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`);
    }

    if (labelId) {
      query += ` AND h.id IN (SELECT habit_id FROM habit_labels WHERE label_id = ?)`;
      params.push(labelId);
    }

    query += ` ORDER BY h.created_at DESC`;

    const habits = db.prepare(query).all(...params);

    const formatted = habits.map(h => ({
      id: h.id,
      userId: h.user_id,
      name: h.name,
      description: h.description || '',
      startDate: h.start_date,
      endDate: h.end_date || null,
      frequency: h.frequency,
      goal: h.goal,
      color: h.color,
      status: h.status,
      todayCompletedCount: h.today_completed_count,
      isCompletedToday: Boolean(h.is_completed_today),
      labels: getHabitLabels(h.id),
      createdAt: h.created_at,
      updatedAt: h.updated_at
    }));

    return res.json({ habits: formatted });
  } catch (err) {
    next(err);
  }
});

// POST /api/habits
router.post('/', (req, res, next) => {
  try {
    const {
      name,
      description = '',
      startDate,
      endDate = null,
      frequency = 'DAILY',
      goal = 1,
      color = 'blue',
      labelIds = []
    } = req.body || {};

    const details = {};
    if (!name || !name.trim()) {
      details.name = 'Name is required';
    }

    const validFrequencies = ['DAILY', 'WEEKLY', 'MONTHLY'];
    if (frequency && !validFrequencies.includes(frequency.toUpperCase())) {
      details.frequency = 'Frequency must be DAILY, WEEKLY, or MONTHLY';
    }

    if (Object.keys(details).length > 0) {
      return next(createError('VALIDATION_ERROR', 'Input validation failed', details));
    }

    const finalStartDate = startDate && /^\d{4}-\d{2}-\d{2}$/.test(startDate)
      ? startDate
      : getTodayString();

    const habitId = crypto.randomUUID();
    const finalFreq = (frequency || 'DAILY').toUpperCase();
    const parsedGoal = Math.max(1, parseInt(goal, 10) || 1);

    db.prepare(`
      INSERT INTO habits (id, user_id, name, description, start_date, end_date, frequency, goal, color, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'active')
    `).run(habitId, req.user.id, name.trim(), description.trim(), finalStartDate, endDate || null, finalFreq, parsedGoal, color || 'blue');

    if (Array.isArray(labelIds) && labelIds.length > 0) {
      const linkStmt = db.prepare('INSERT OR IGNORE INTO habit_labels (habit_id, label_id) VALUES (?, ?)');
      for (const lId of labelIds) {
        // verify label belongs to user
        const label = db.prepare('SELECT id FROM labels WHERE id = ? AND user_id = ?').get(lId, req.user.id);
        if (label) {
          linkStmt.run(habitId, lId);
        }
      }
    }

    const created = db.prepare('SELECT * FROM habits WHERE id = ?').get(habitId);
    return res.status(201).json({
      habit: {
        id: created.id,
        userId: created.user_id,
        name: created.name,
        description: created.description || '',
        startDate: created.start_date,
        endDate: created.end_date || null,
        frequency: created.frequency,
        goal: created.goal,
        color: created.color,
        status: created.status,
        todayCompletedCount: 0,
        isCompletedToday: false,
        labels: getHabitLabels(created.id),
        createdAt: created.created_at,
        updatedAt: created.updated_at
      }
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/habits/:id
router.get('/:id', (req, res, next) => {
  try {
    const habit = db.prepare('SELECT * FROM habits WHERE id = ? AND user_id = ?').get(req.params.id, req.user.id);
    if (!habit) {
      return next(createError('NOT_FOUND', 'Habit not found'));
    }

    const targetDate = req.query.date || getTodayString();
    const completionToday = db.prepare('SELECT count FROM completions WHERE habit_id = ? AND date = ?').get(habit.id, targetDate);

    // Fetch month completions or all recent completions
    const completions = db.prepare('SELECT date, count FROM completions WHERE habit_id = ? ORDER BY date DESC').all(habit.id);

    return res.json({
      habit: {
        id: habit.id,
        userId: habit.user_id,
        name: habit.name,
        description: habit.description || '',
        startDate: habit.start_date,
        endDate: habit.end_date || null,
        frequency: habit.frequency,
        goal: habit.goal,
        color: habit.color,
        status: habit.status,
        todayCompletedCount: completionToday ? completionToday.count : 0,
        isCompletedToday: completionToday ? completionToday.count >= habit.goal : false,
        labels: getHabitLabels(habit.id),
        completions: completions.map(c => ({ date: c.date, count: c.count })),
        createdAt: habit.created_at,
        updatedAt: habit.updated_at
      }
    });
  } catch (err) {
    next(err);
  }
});

// PATCH /api/habits/:id
router.patch('/:id', (req, res, next) => {
  try {
    const habit = db.prepare('SELECT * FROM habits WHERE id = ? AND user_id = ?').get(req.params.id, req.user.id);
    if (!habit) {
      return next(createError('NOT_FOUND', 'Habit not found'));
    }

    const {
      name,
      description,
      startDate,
      endDate,
      frequency,
      goal,
      color,
      status,
      labelIds
    } = req.body || {};

    const updates = [];
    const params = [];

    if (name !== undefined) {
      if (!name.trim()) {
        return next(createError('VALIDATION_ERROR', 'Name cannot be empty', { name: 'Name is required' }));
      }
      updates.push('name = ?');
      params.push(name.trim());
    }

    if (description !== undefined) {
      updates.push('description = ?');
      params.push(description.trim());
    }

    if (startDate !== undefined) {
      updates.push('start_date = ?');
      params.push(startDate);
    }

    if (endDate !== undefined) {
      updates.push('end_date = ?');
      params.push(endDate || null);
    }

    if (frequency !== undefined) {
      const valid = ['DAILY', 'WEEKLY', 'MONTHLY'];
      if (!valid.includes(frequency.toUpperCase())) {
        return next(createError('VALIDATION_ERROR', 'Invalid frequency', { frequency: 'Must be DAILY, WEEKLY, or MONTHLY' }));
      }
      updates.push('frequency = ?');
      params.push(frequency.toUpperCase());
    }

    if (goal !== undefined) {
      updates.push('goal = ?');
      params.push(Math.max(1, parseInt(goal, 10) || 1));
    }

    if (color !== undefined) {
      updates.push('color = ?');
      params.push(color);
    }

    if (status !== undefined) {
      const validStatuses = ['active', 'archived', 'trashed'];
      if (!validStatuses.includes(status)) {
        return next(createError('VALIDATION_ERROR', 'Invalid status'));
      }
      updates.push('status = ?');
      params.push(status);
    }

    updates.push("updated_at = datetime('now')");

    if (updates.length > 1) { // more than just updated_at
      params.push(habit.id, req.user.id);
      db.prepare(`UPDATE habits SET ${updates.join(', ')} WHERE id = ? AND user_id = ?`).run(...params);
    }

    if (Array.isArray(labelIds)) {
      db.prepare('DELETE FROM habit_labels WHERE habit_id = ?').run(habit.id);
      const linkStmt = db.prepare('INSERT OR IGNORE INTO habit_labels (habit_id, label_id) VALUES (?, ?)');
      for (const lId of labelIds) {
        const label = db.prepare('SELECT id FROM labels WHERE id = ? AND user_id = ?').get(lId, req.user.id);
        if (label) {
          linkStmt.run(habit.id, lId);
        }
      }
    }

    const updated = db.prepare('SELECT * FROM habits WHERE id = ?').get(habit.id);
    const todayStr = getTodayString();
    const completionToday = db.prepare('SELECT count FROM completions WHERE habit_id = ? AND date = ?').get(habit.id, todayStr);

    return res.json({
      habit: {
        id: updated.id,
        userId: updated.user_id,
        name: updated.name,
        description: updated.description || '',
        startDate: updated.start_date,
        endDate: updated.end_date || null,
        frequency: updated.frequency,
        goal: updated.goal,
        color: updated.color,
        status: updated.status,
        todayCompletedCount: completionToday ? completionToday.count : 0,
        isCompletedToday: completionToday ? completionToday.count >= updated.goal : false,
        labels: getHabitLabels(updated.id),
        createdAt: updated.created_at,
        updatedAt: updated.updated_at
      }
    });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/habits/:id
router.delete('/:id', (req, res, next) => {
  try {
    const habit = db.prepare('SELECT * FROM habits WHERE id = ? AND user_id = ?').get(req.params.id, req.user.id);
    if (!habit) {
      return next(createError('NOT_FOUND', 'Habit not found'));
    }

    if (req.query.permanent === 'true') {
      // Permanent deletion removes completions and habit
      db.prepare('DELETE FROM completions WHERE habit_id = ?').run(habit.id);
      db.prepare('DELETE FROM habit_labels WHERE habit_id = ?').run(habit.id);
      db.prepare('DELETE FROM habits WHERE id = ?').run(habit.id);
      return res.json({ message: 'Habit permanently deleted' });
    }

    // Soft delete: move to trash
    db.prepare("UPDATE habits SET status = 'trashed', updated_at = datetime('now') WHERE id = ?").run(habit.id);
    return res.json({ message: 'Habit moved to trash' });
  } catch (err) {
    next(err);
  }
});

// POST /api/habits/:id/archive
router.post('/:id/archive', (req, res, next) => {
  try {
    const habit = db.prepare('SELECT * FROM habits WHERE id = ? AND user_id = ?').get(req.params.id, req.user.id);
    if (!habit) {
      return next(createError('NOT_FOUND', 'Habit not found'));
    }

    db.prepare("UPDATE habits SET status = 'archived', updated_at = datetime('now') WHERE id = ?").run(habit.id);
    return res.json({ message: 'Habit archived successfully' });
  } catch (err) {
    next(err);
  }
});

// POST /api/habits/:id/unarchive
router.post('/:id/unarchive', (req, res, next) => {
  try {
    const habit = db.prepare('SELECT * FROM habits WHERE id = ? AND user_id = ?').get(req.params.id, req.user.id);
    if (!habit) {
      return next(createError('NOT_FOUND', 'Habit not found'));
    }

    db.prepare("UPDATE habits SET status = 'active', updated_at = datetime('now') WHERE id = ?").run(habit.id);
    return res.json({ message: 'Habit unarchived successfully' });
  } catch (err) {
    next(err);
  }
});

// POST /api/habits/:id/restore
router.post('/:id/restore', (req, res, next) => {
  try {
    const habit = db.prepare('SELECT * FROM habits WHERE id = ? AND user_id = ?').get(req.params.id, req.user.id);
    if (!habit) {
      return next(createError('NOT_FOUND', 'Habit not found'));
    }

    db.prepare("UPDATE habits SET status = 'active', updated_at = datetime('now') WHERE id = ?").run(habit.id);
    return res.json({ message: 'Habit restored successfully' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
