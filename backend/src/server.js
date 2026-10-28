require('dotenv').config();
const app = require('./app');
const seedDemoData = require('./seed');

const PORT = process.env.PORT || 5001;

// Seed demo data if fresh
try {
  seedDemoData();
} catch (err) {
  console.error('Seed error:', err);
}

app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});
