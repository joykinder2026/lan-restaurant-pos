const express = require('express');
const db = require('../config/database');
const auth = require('../middleware/auth');
const authorize = require('../middleware/authorization');

const router = express.Router();

router.get('/', auth, authorize('owner', 'admin', 'manager', 'supervisor', 'staff'), (req, res) => {
  db.all(
    `SELECT * FROM materials WHERE store_id = ? AND is_active = 1 ORDER BY material_name ASC`,
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
  const { material_code, material_name, unit, current_quantity, min_quantity, unit_price, supplier, notes } = req.body;

  if (!material_code || !material_name || !unit || !unit_price) {
    return res.status(400).json({ message: 'Material code, name, unit, and unit price are required.' });
  }

  db.run(
    `INSERT INTO materials (store_id, material_code, material_name, unit, current_quantity, min_quantity, unit_price, supplier, notes)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [req.user.store_id, material_code, material_name, unit, Number(current_quantity || 0), Number(min_quantity || 0), Number(unit_price), supplier || null, notes || null],
    function (err) {
      if (err) {
        return res.status(400).json({ message: 'Unable to create material', error: err.message });
      }

      res.status(201).json({ id: this.lastID, material_code, material_name, unit, unit_price });
    }
  );
});

module.exports = router;
