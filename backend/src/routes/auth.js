const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/database');

const router = require('express').Router();

router.post('/login', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password are required.' });
  }

  db.get(
    `SELECT u.*, s.name as store_name FROM users u LEFT JOIN stores s ON s.id = u.store_id WHERE u.username = ? AND u.is_active = 1`,
    [username],
    async (err, user) => {
      if (err) {
        return res.status(500).json({ message: 'Database error', error: err.message });
      }

      if (!user) {
        return res.status(401).json({ message: 'Invalid username or password.' });
      }

      const isMatch = await bcrypt.compare(password, user.password_hash);

      if (!isMatch) {
        return res.status(401).json({ message: 'Invalid username or password.' });
      }

      const token = jwt.sign(
        {
          id: user.id,
          store_id: user.store_id,
          username: user.username,
          role: user.role,
        },
        process.env.JWT_SECRET || 'lan_restaurant_pos_secret_2026',
        { expiresIn: '7d' }
      );

      res.json({
        token,
        user: {
          id: user.id,
          username: user.username,
          role: user.role,
          full_name: user.full_name,
          store_id: user.store_id,
          store_name: user.store_name,
          email: user.email,
        },
      });
    }
  );
});

router.get('/me', require('../middleware/auth'), (req, res) => {
  db.get(
    `SELECT u.*, s.name as store_name FROM users u LEFT JOIN stores s ON s.id = u.store_id WHERE u.id = ?`,
    [req.user.id],
    (err, user) => {
      if (err) {
        return res.status(500).json({ message: 'Database error', error: err.message });
      }

      if (!user) {
        return res.status(404).json({ message: 'User not found.' });
      }

      res.json({
        id: user.id,
        username: user.username,
        role: user.role,
        full_name: user.full_name,
        email: user.email,
        store_id: user.store_id,
        store_name: user.store_name,
      });
    }
  );
});

module.exports = router;
