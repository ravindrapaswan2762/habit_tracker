const express = require('express');

const router = express.Router();

const QUOTES = [
  { quote: "It always seems impossible until it's done.", author: "Nelson Mandela" },
  { quote: "We are what we repeatedly do. Excellence, then, is not an act, but a habit.", author: "Will Durant" },
  { quote: "Small disciplines repeated with consistency every day lead to great achievements.", author: "John C. Maxwell" },
  { quote: "You do not rise to the level of your goals. You fall to the level of your systems.", author: "James Clear" },
  { quote: "The secret of getting ahead is getting started.", author: "Mark Twain" },
  { quote: "Action is the foundational key to all success.", author: "Pablo Picasso" },
  { quote: "Motivation is what gets you started. Habit is what keeps you going.", author: "Jim Ryun" }
];

// GET /api/quotes/daily
router.get('/daily', (req, res) => {
  const dayOfYear = Math.floor((new Date() - new Date(new Date().getFullYear(), 0, 0)) / 1000 / 60 / 60 / 24);
  const selected = QUOTES[dayOfYear % QUOTES.length];
  return res.json({ quote: selected.quote, author: selected.author });
});

module.exports = router;
