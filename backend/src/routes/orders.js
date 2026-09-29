const express = require('express');
const db = require('../config/database');
const auth = require('../middleware/auth');
const authorize = require('../middleware/authorization');

const router = express.Router();

router.get('/', auth, authorize('owner', 'admin', 'manager', 'supervisor', 'staff'), (req, res) => {
  db.all(
    `SELECT * FROM table_config WHERE store_id = ? ORDER BY table_number ASC`,
    [req.user.store_id],
    (err, rows) => {
      if (err) {
        return res.status(500).json({ message: 'Database error', error: err.message });
      }
      res.json(rows);
    }
  );
});

router.post('/', auth, authorize('owner', 'admin', 'manager'), (req, res) => {
  const { table_number, table_name, capacity } = req.body;

  if (!table_number || !table_name) {
    return res.status(400).json({ message: 'Table number and table name are required.' });
  }

  db.run(
    `INSERT INTO table_config (store_id, table_number, table_name, capacity, status)
     VALUES (?, ?, ?, ?, 'available')`,
    [req.user.store_id, Number(table_number), table_name, Number(capacity || 2)],
    function (err) {
      if (err) {
        return res.status(400).json({ message: 'Unable to create table', error: err.message });
      }

      res.status(201).json({ id: this.lastID, table_number, table_name, capacity: Number(capacity || 2) });
    }
  );
});

module.exports = router;
