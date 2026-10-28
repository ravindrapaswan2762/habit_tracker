const express = require('express');
const cors = require('cors');
const { errorHandler, createError } = require('./utils/errors');

const authRouter = require('./routes/auth');
const habitsRouter = require('./routes/habits');
const completionsRouter = require('./routes/completions');
const dashboardRouter = require('./routes/dashboard');
const labelsRouter = require('./routes/labels');
const quotesRouter = require('./routes/quotes');
const exportRouter = require('./routes/export');

const app = express();

app.use(cors({
  origin: '*',
  credentials: true
}));
app.use(express.json());

// API Contract routes
app.use('/api/auth', authRouter);
app.use('/api/habits/:id/completions', completionsRouter);
app.use('/api/habits', habitsRouter);
app.use('/api/dashboard', dashboardRouter);
app.use('/api/labels', labelsRouter);
app.use('/api/quotes', quotesRouter);
app.use('/api/export', exportRouter);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 404 handler for unknown routes
app.use((req, res, next) => {
  next(createError('NOT_FOUND', `Route ${req.method} ${req.url} not found`));
});

// Centralized error handler
app.use(errorHandler);

module.exports = app;

