const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('node:crypto');
const db = require('../db');
const { createError } = require('../utils/errors');
const { requireAuth, JWT_SECRET } = require('../middleware/auth');

const router = express.Router();

function generateToken(userId) {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' });
}

// POST /api/auth/signup
router.post('/signup', (req, res, next) => {
  const { firstName, lastName, email, password } = req.body || {};
  const details = {};

  if (!firstName || !firstName.trim()) {
    details.firstName = 'First name is required';
  }
  if (!lastName || !lastName.trim()) {
    details.lastName = 'Last name is required';
  }
  if (!email || !email.trim()) {
    details.email = 'Email is required';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
    details.email = 'Invalid email address';
  }
  if (!password || password.length < 6) {
    details.password = 'Password must be at least 6 characters long';
  }

  if (Object.keys(details).length > 0) {
    return next(createError('VALIDATION_ERROR', 'Input validation failed', details));
  }

  const normalizedEmail = email.trim().toLowerCase();

  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(normalizedEmail);
  if (existing) {
    return next(createError('CONFLICT', 'An account with this email already exists', {
      email: 'Email is already registered'
    }));
  }

  const salt = bcrypt.genSaltSync(10);
  const passwordHash = bcrypt.hashSync(password, salt);
  const userId = crypto.randomUUID();

  db.prepare(`
    INSERT INTO users (id, first_name, last_name, email, password_hash)
    VALUES (?, ?, ?, ?, ?)
  `).run(userId, firstName.trim(), lastName.trim(), normalizedEmail, passwordHash);

  // Pre-populate some default labels for new user
  const defaultLabels = ['Health', 'Work', 'Personal', 'Study'];
  const insertLabelStmt = db.prepare('INSERT INTO labels (id, user_id, name, color) VALUES (?, ?, ?, ?)');
  const colors = ['#3B82F6', '#EC4899', '#EAB308', '#10B981'];
  defaultLabels.forEach((name, idx) => {
    insertLabelStmt.run(crypto.randomUUID(), userId, name, colors[idx]);
  });

  const token = generateToken(userId);
  return res.status(201).json({
    user: {
      id: userId,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: normalizedEmail
    },
    token
  });
});

// POST /api/auth/login
router.post('/login', (req, res, next) => {
  const { email, password } = req.body || {};
  const details = {};

  if (!email || !email.trim()) {
    details.email = 'Email is required';
  }
  if (!password) {
    details.password = 'Password is required';
  }

  if (Object.keys(details).length > 0) {
    return next(createError('VALIDATION_ERROR', 'Input validation failed', details));
  }

  const normalizedEmail = email.trim().toLowerCase();
  const user = db.prepare('SELECT id, first_name, last_name, email, password_hash FROM users WHERE email = ?').get(normalizedEmail);

  if (!user || !bcrypt.compareSync(password, user.password_hash)) {
    return next(createError('UNAUTHORIZED', 'Invalid email or password'));
  }

  const token = generateToken(user.id);
  return res.json({
    user: {
      id: user.id,
      firstName: user.first_name,
      lastName: user.last_name,
      email: user.email
    },
    token
  });
});

// POST /api/auth/logout
router.post('/logout', (req, res) => {
  return res.json({ message: 'Logged out successfully' });
});

// GET /api/auth/me
router.get('/me', requireAuth, (req, res) => {
  return res.json({
    user: req.user
  });
});

module.exports = router;

