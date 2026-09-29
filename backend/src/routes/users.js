const express = require('express');
const bcrypt = require('bcryptjs');
const db = require('../config/database');
const auth = require('../middleware/auth');
const authorize = require('../middleware/authorization');

const router = express.Router();

router.get('/', auth, authorize('owner', 'admin', 'manager'), (req, res) => {
  db.all(
    `SELECT u.id, u.username, u.email, u.role, u.full_name, u.is_active, u.store_id, s.name as store_name
     FROM users u
     LEFT JOIN stores s ON s.id = u.store_id
     ORDER BY u.id DESC`,
    (err, rows) => {
      if (err) {
        return res.status(500).json({ message: 'Database error', error: err.message });
      }
      res.json(rows);
    }
  );
});

router.post('/', auth, authorize('owner', 'admin'), async (req, res) => {
  const { username, password, email, role, full_name, store_id } = req.body;

  if (!username || !password || !role || !store_id) {
    return res.status(400).json({ message: 'Username, password, role, and store_id are required.' });
  }

  const password_hash = await bcrypt.hash(password, 10);

  db.run(
    `INSERT INTO users (store_id, username, password_hash, email, role, full_name, created_by)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [store_id, username, password_hash, email || null, role, full_name || null, req.user.id],
    function (err) {
      if (err) {
        return res.status(400).json({ message: 'Unable to create user', error: err.message });
      }

      res.status(201).json({ id: this.lastID, username, role, store_id });
    }
  );
});

module.exports = router;
