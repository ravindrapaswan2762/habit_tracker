const express = require('express');
const crypto = require('node:crypto');
const db = require('../db');
const { createError } = require('../utils/errors');
const { requireAuth } = require('../middleware/auth');

const router = express.Router({ mergeParams: true });
router.use(requireAuth);

function isValidDate(str) {
  return /^\d{4}-\d{2}-\d{2}$/.test(str);
}

// GET /api/habits/:id/completions
router.get('/', (req, res, next) => {
  try {
    const habitId = req.params.id;
    const habit = db.prepare('SELECT id FROM habits WHERE id = ? AND user_id = ?').get(habitId, req.user.id);
    if (!habit) {
      return next(createError('NOT_FOUND', 'Habit not found'));
    }

    const { from, to } = req.query;
    let query = 'SELECT id, habit_id AS habitId, date, count, created_at AS createdAt FROM completions WHERE habit_id = ?';
    const params = [habitId];

    if (from && isValidDate(from)) {
      query += ' AND date >= ?';
      params.push(from);
    }
    if (to && isValidDate(to)) {
      query += ' AND date <= ?';
      params.push(to);
    }

    query += ' ORDER BY date DESC';

    const completions = db.prepare(query).all(...params);
    return res.json({ completions });
  } catch (err) {
    next(err);
  }
});

// PUT /api/habits/:id/completions/:date
router.put('/:date', (req, res, next) => {
  try {
    const habitId = req.params.id;
    const date = req.params.date;

    if (!isValidDate(date)) {
      return next(createError('VALIDATION_ERROR', 'Date must be in YYYY-MM-DD format', { date: 'Invalid date format' }));
    }

    const habit = db.prepare('SELECT id, goal FROM habits WHERE id = ? AND user_id = ?').get(habitId, req.user.id);
    if (!habit) {
      return next(createError('NOT_FOUND', 'Habit not found'));
    }

    const bodyCount = req.body && req.body.count !== undefined ? parseInt(req.body.count, 10) : null;
    const increment = req.body && req.body.increment === true;

    // Check existing
    const existing = db.prepare('SELECT id, count FROM completions WHERE habit_id = ? AND date = ?').get(habitId, date);

    let newCount = 1;
    if (bodyCount !== null) {
      newCount = Math.max(1, bodyCount);
    } else if (existing && increment) {
      newCount = existing.count + 1;
    } else if (habit.goal) {
      // By default if completing without count, set to goal or 1
      newCount = habit.goal;
    }

    if (existing) {
      db.prepare('UPDATE completions SET count = ? WHERE id = ?').run(newCount, existing.id);
      const record = db.prepare('SELECT id, habit_id AS habitId, date, count FROM completions WHERE id = ?').get(existing.id);
      return res.json({
        completion: record,
        message: 'Completion updated'
      });
    }

    const compId = crypto.randomUUID();
    db.prepare(`
      INSERT INTO completions (id, habit_id, date, count)
      VALUES (?, ?, ?, ?)
    `).run(compId, habitId, date, newCount);

    const record = db.prepare('SELECT id, habit_id AS habitId, date, count FROM completions WHERE id = ?').get(compId);
    return res.status(200).json({
      completion: record,
      message: 'Habit marked as completed'
    });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/habits/:id/completions/:date
router.delete('/:date', (req, res, next) => {
  try {
    const habitId = req.params.id;
    const date = req.params.date;

    if (!isValidDate(date)) {
      return next(createError('VALIDATION_ERROR', 'Date must be in YYYY-MM-DD format'));
    }

    const habit = db.prepare('SELECT id FROM habits WHERE id = ? AND user_id = ?').get(habitId, req.user.id);
    if (!habit) {
      return next(createError('NOT_FOUND', 'Habit not found'));
    }

    const result = db.prepare('DELETE FROM completions WHERE habit_id = ? AND date = ?').run(habitId, date);
    return res.json({
      message: 'Completion removed',
      changes: result.changes
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
