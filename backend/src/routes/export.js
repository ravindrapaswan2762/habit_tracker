const express = require('express');
const db = require('../db');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();
router.use(requireAuth);

// GET /api/export/csv
router.get('/csv', (req, res, next) => {
  try {
    const userId = req.user.id;
    const records = db.prepare(`
      SELECT h.name AS habit_name,
             h.frequency,
             h.goal,
             h.status,
             c.date AS completion_date,
             c.count AS completion_count
      FROM habits h
      LEFT JOIN completions c ON c.habit_id = h.id
      WHERE h.user_id = ?
      ORDER BY h.name ASC, c.date DESC
    `).all(userId);

    const headers = ['Habit Name', 'Frequency', 'Goal', 'Status', 'Completion Date', 'Completion Count'];
    const rows = records.map(r => [
      `"${(r.habit_name || '').replace(/"/g, '""')}"`,
      r.frequency,
      r.goal,
      r.status,
      r.completion_date || '',
      r.completion_count || 0
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="habits_export.csv"');
    return res.status(200).send(csvContent);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
