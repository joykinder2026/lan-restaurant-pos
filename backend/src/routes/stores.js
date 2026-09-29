const express = require('express');
const db = require('../config/database');
const auth = require('../middleware/auth');
const authorize = require('../middleware/authorization');

const router = express.Router();

router.get('/', auth, authorize('owner', 'admin', 'manager'), (req, res) => {
  const query = `SELECT * FROM stores ORDER BY created_at DESC`;

  db.all(query, (err, rows) => {
    if (err) {
      return res.status(500).json({ message: 'Database error', error: err.message });
    }
    res.json(rows);
  });
});

router.post('/', auth, authorize('owner', 'admin'), (req, res) => {
  const { id, name, address, phone, email } = req.body;

  if (!id || !name) {
    return res.status(400).json({ message: 'Store id and name are required.' });
  }

  db.run(
    `INSERT INTO stores (id, name, owner_id, address, phone, email) VALUES (?, ?, ?, ?, ?, ?)`,
    [id, name, req.user.id, address || null, phone || null, email || null],
    function (err) {
      if (err) {
        return res.status(400).json({ message: 'Unable to create store', error: err.message });
      }

      res.status(201).json({ id, name, owner_id: req.user.id });
    }
  );
});

module.exports = router;
