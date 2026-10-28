const express = require('express');
const db = require('../db');
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

// GET /api/dashboard/stats
router.get('/stats', (req, res, next) => {
  try {
    const today = req.query.date || getTodayString();
    const userId = req.user.id;

    // Active habits
    const activeHabits = db.prepare(`
      SELECT h.*,
             COALESCE(c.count, 0) AS today_count,
             CASE WHEN c.id IS NOT NULL AND c.count >= h.goal THEN 1 ELSE 0 END AS is_completed_today
      FROM habits h
      LEFT JOIN completions c ON c.habit_id = h.id AND c.date = ?
      WHERE h.user_id = ? AND h.status = 'active'
    `).all(today, userId);

    const total = activeHabits.length;
    let completed = 0;
    let inProgress = 0;
    let overdue = 0;

    for (const h of activeHabits) {
      if (h.is_completed_today) {
        completed++;
      } else if (h.today_count > 0) {
        inProgress++;
      } else {
        overdue++;
      }
    }

    // Calculate current streak (days with at least 1 completed habit moving backwards from today/yesterday)
    const userCompletions = db.prepare(`
      SELECT DISTINCT c.date
      FROM completions c
      JOIN habits h ON h.id = c.habit_id
      WHERE h.user_id = ?
      ORDER BY c.date DESC
    `).all(userId).map(r => r.date);

    let streak = 0;
    const checkDate = new Date();
    // check if completed today
    const dateStr = (d) => {
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    let cur = new Date(checkDate);
    const todayStr = dateStr(cur);
    let hasToday = userCompletions.includes(todayStr);

    if (!hasToday) {
      // check if yesterday had completion
      cur.setDate(cur.getDate() - 1);
      if (!userCompletions.includes(dateStr(cur))) {
        streak = 0;
      } else {
        while (userCompletions.includes(dateStr(cur))) {
          streak++;
          cur.setDate(cur.getDate() - 1);
        }
      }
    } else {
      while (userCompletions.includes(dateStr(cur))) {
        streak++;
        cur.setDate(cur.getDate() - 1);
      }
    }

    // Weekly completion rate (past 7 days)
    const past7Days = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      past7Days.push(dateStr(d));
    }

    const completionsLast7Days = db.prepare(`
      SELECT COUNT(*) AS count
      FROM completions c
      JOIN habits h ON h.id = c.habit_id
      WHERE h.user_id = ? AND h.status = 'active' AND c.date IN (${past7Days.map(() => '?').join(',')})
    `).get(userId, ...past7Days).count;

    const expectedWeekly = total * 7;
    const completionRate = expectedWeekly > 0
      ? Math.min(100, Math.round((completionsLast7Days / expectedWeekly) * 100))
      : (completed > 0 ? 100 : 0);

    // Habit Score out of 100
    // Factor: today's completion (40%) + weekly completion rate (40%) + streak bonus (up to 20%)
    const todayRate = total > 0 ? (completed / total) * 40 : 0;
    const weekRate = (completionRate / 100) * 40;
    const streakBonus = Math.min(20, streak * 4);
    const habitScore = Math.min(100, Math.round(todayRate + weekRate + streakBonus));

    return res.json({
      stats: {
        completed,
        inProgress,
        overdue,
        total,
        currentStreak: streak,
        todayCount: completed,
        habitScore,
        moodScore: 4, // Default mood rating out of 5
        completionRate,
        period: {
          from: past7Days[6],
          to: past7Days[0]
        }
      }
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;

