const express = require('express');
const db = require('../config/database');
const auth = require('../middleware/auth');
const authorize = require('../middleware/authorization');

const router = express.Router();

router.get('/summary', auth, authorize('owner', 'admin', 'manager', 'supervisor', 'staff'), (req, res) => {
  const summaryQueries = {
    orderCount: `SELECT COUNT(*) AS count FROM orders WHERE store_id = ?`,
    revenue: `SELECT COALESCE(SUM(total), 0) AS value FROM orders WHERE store_id = ? AND status = 'completed'`,
    materialCount: `SELECT COUNT(*) AS count FROM materials WHERE store_id = ? AND is_active = 1`,
    itemCount: `SELECT COUNT(*) AS count FROM menu_items WHERE store_id = ? AND is_active = 1`,
    tableCount: `SELECT COUNT(*) AS count FROM table_config WHERE store_id = ?`,
  };

  const tasks = Object.entries(summaryQueries).map(([key, sql]) => new Promise((resolve, reject) => {
    db.get(sql, [req.user.store_id], (err, row) => {
      if (err) reject(err);
      else resolve({ [key]: row.count ?? row.value ?? 0 });
    });
  }));

  Promise.all(tasks)
    .then((results) => {
      const summary = Object.assign({}, ...results);
      res.json(summary);
    })
    .catch((error) => {
      res.status(500).json({ message: 'Database error', error: error.message });
    });
});

module.exports = router;
