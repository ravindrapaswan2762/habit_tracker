const express = require('express');
const crypto = require('node:crypto');
const db = require('../db');
const { createError } = require('../utils/errors');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();
router.use(requireAuth);

// GET /api/labels
router.get('/', (req, res, next) => {
  try {
    const labels = db.prepare(`
      SELECT l.*,
             COUNT(hl.habit_id) AS habit_count
      FROM labels l
      LEFT JOIN habit_labels hl ON hl.label_id = l.id
      WHERE l.user_id = ?
      GROUP BY l.id
      ORDER BY l.name ASC
    `).all(req.user.id);

    return res.json({
      labels: labels.map(l => ({
        id: l.id,
        name: l.name,
        color: l.color,
        habitCount: l.habit_count
      }))
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/labels
router.post('/', (req, res, next) => {
  try {
    const { name, color = '#5B4DFC' } = req.body || {};
    if (!name || !name.trim()) {
      return next(createError('VALIDATION_ERROR', 'Label name is required', { name: 'Name is required' }));
    }

    const labelId = crypto.randomUUID();
    db.prepare('INSERT INTO labels (id, user_id, name, color) VALUES (?, ?, ?, ?)').run(
      labelId,
      req.user.id,
      name.trim(),
      color || '#5B4DFC'
    );

    const created = db.prepare('SELECT * FROM labels WHERE id = ?').get(labelId);
    return res.status(201).json({
      label: {
        id: created.id,
        name: created.name,
        color: created.color,
        habitCount: 0
      }
    });
  } catch (err) {
    next(err);
  }
});

// PATCH /api/labels/:id
router.patch('/:id', (req, res, next) => {
  try {
    const label = db.prepare('SELECT * FROM labels WHERE id = ? AND user_id = ?').get(req.params.id, req.user.id);
    if (!label) {
      return next(createError('NOT_FOUND', 'Label not found'));
    }

    const { name, color } = req.body || {};
    const updates = [];
    const params = [];

    if (name !== undefined) {
      if (!name.trim()) {
        return next(createError('VALIDATION_ERROR', 'Name cannot be empty'));
      }
      updates.push('name = ?');
      params.push(name.trim());
    }

    if (color !== undefined) {
      updates.push('color = ?');
      params.push(color);
    }

    if (updates.length > 0) {
      params.push(label.id);
      db.prepare(`UPDATE labels SET ${updates.join(', ')} WHERE id = ?`).run(...params);
    }

    const updated = db.prepare('SELECT * FROM labels WHERE id = ?').get(label.id);
    return res.json({
      label: {
        id: updated.id,
        name: updated.name,
        color: updated.color
      }
    });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/labels/:id
router.delete('/:id', (req, res, next) => {
  try {
    const label = db.prepare('SELECT * FROM labels WHERE id = ? AND user_id = ?').get(req.params.id, req.user.id);
    if (!label) {
      return next(createError('NOT_FOUND', 'Label not found'));
    }

    db.prepare('DELETE FROM habit_labels WHERE label_id = ?').run(label.id);
    db.prepare('DELETE FROM labels WHERE id = ?').run(label.id);

    return res.json({ message: 'Label deleted' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;

