
const router = require('express').Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

module.exports = (db) => {

  router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
      const result = await db.query('SELECT * FROM users WHERE email = $1', [email]);
      const user = result.rows[0];

      if (!user) return res.status(401).json({ error: 'Invalid credentials' });

      if (user.is_suspended) return res.status(403).json({ error: 'Account suspended' });

      // In real app: await bcrypt.compare(password, user.password_hash)
      // For Demo/Mock purposes we assume simple check if using plain text in dev, but use bcrypt in prod
      const validPassword = await bcrypt.compare(password, user.password_hash);
      
      if (!validPassword) return res.status(401).json({ error: 'Invalid credentials' });

      // Generate Token
      const token = jwt.sign(
        { id: user.id, role: user.role, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: '8h' }
      );

      // Audit Log
      await db.query(
        `INSERT INTO audit_logs (user_id, user_role, action, ip_address) VALUES ($1, $2, 'LOGIN', $3)`,
        [user.id, user.role, req.ip]
      );

      res.json({
        token,
        user: {
          id: user.id,
          name: user.full_name,
          email: user.email,
          role: user.role
        }
      });

    } catch (err) {
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

  return router;
};
