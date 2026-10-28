const jwt = require('jsonwebtoken');
const db = require('../db');
const { createError } = require('../utils/errors');

const JWT_SECRET = process.env.JWT_SECRET || 'habit-tracker-dev-secret-key-2026';

function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(createError('UNAUTHORIZED', 'Authentication token required'));
  }

  const token = authHeader.split(' ')[1];
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    const userStmt = db.prepare('SELECT id, first_name, last_name, email FROM users WHERE id = ?');
    const user = userStmt.get(payload.userId);

    if (!user) {
      return next(createError('UNAUTHORIZED', 'User not found or session invalid'));
    }

    req.user = {
      id: user.id,
      firstName: user.first_name,
      lastName: user.last_name,
      email: user.email
    };
    next();
  } catch (err) {
    return next(createError('UNAUTHORIZED', 'Invalid or expired authentication token'));
  }
}

module.exports = {
  requireAuth,
  JWT_SECRET
};
