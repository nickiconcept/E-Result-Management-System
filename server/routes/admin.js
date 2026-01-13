
const router = require('express').Router();
const { authenticate, authorize } = require('../middleware/auth');

module.exports = (db) => {

  // GET: Dashboard Stats
  router.get('/stats', authenticate, authorize(['ADMIN', 'PRINCIPAL']), async (req, res) => {
    try {
      // Parallel queries for performance
      const [students, users, scores] = await Promise.all([
        db.query('SELECT COUNT(*) FROM students'),
        db.query('SELECT COUNT(*) FROM users'),
        db.query('SELECT AVG(total) as avg_score FROM scores')
      ]);

      res.json({
        totalStudents: parseInt(students.rows[0].count),
        totalUsers: parseInt(users.rows[0].count),
        averageScore: parseFloat(scores.rows[0].avg_score || 0).toFixed(1)
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // POST: Create User (Teacher/Principal)
  router.post('/users', authenticate, authorize(['ADMIN']), async (req, res) => {
    const { name, email, password, role } = req.body;
    // Note: In production, hash password here using bcrypt
    const passwordHash = password; // simplistic for demo
    
    try {
      const result = await db.query(
        'INSERT INTO users (full_name, email, password_hash, role) VALUES ($1, $2, $3, $4) RETURNING id, email',
        [name, email, passwordHash, role]
      );
      res.json(result.rows[0]);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  });

  return router;
};
