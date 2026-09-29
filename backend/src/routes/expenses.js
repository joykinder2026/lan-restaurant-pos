const express = require('express');
const db = require('../config/database');
const auth = require('../middleware/auth');
const authorize = require('../middleware/authorization');

const router = express.Router();

router.get('/', auth, authorize('owner', 'admin', 'manager', 'supervisor', 'staff'), (req, res) => {
  db.all(
    `SELECT * FROM daily_expenses WHERE store_id = ? ORDER BY expense_date DESC`,
    [req.user.store_id],
    (err, rows) => {
      if (err) return res.status(500).json({ message: 'Database error', error: err.message });
      res.json(rows);
    }
  );
});

router.post('/', auth, authorize('owner', 'admin', 'manager'), (req, res) => {
  const { expense_date, category, description, amount, paid_by, receipt_number, notes } = req.body;

  if (!expense_date || !category || !description || !amount) {
    return res.status(400).json({ message: 'Date, category, description, and amount are required.' });
  }

  db.run(
    `INSERT INTO daily_expenses (store_id, expense_date, category, description, amount, paid_by, receipt_number, notes)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [req.user.store_id, expense_date, category, description, Number(amount), paid_by || req.user.id, receipt_number || null, notes || null],
    function (err) {
      if (err) return res.status(400).json({ message: 'Unable to add expense', error: err.message });
      res.status(201).json({ id: this.lastID, expense_date, category, amount });
    }
  );
});

module.exports = router;
