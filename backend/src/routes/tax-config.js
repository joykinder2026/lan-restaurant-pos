const express = require('express');
const db = require('../config/database');
const auth = require('../middleware/auth');
const authorize = require('../middleware/authorization');

const router = express.Router();

router.get('/', auth, authorize('owner', 'admin', 'manager', 'supervisor', 'staff'), (req, res) => {
  db.all(
    `SELECT * FROM tax_service_configs WHERE store_id = ? ORDER BY effective_date DESC`,
    [req.user.store_id],
    (err, rows) => {
      if (err) return res.status(500).json({ message: 'Database error', error: err.message });
      res.json(rows);
    }
  );
});

router.post('/', auth, authorize('owner', 'admin', 'manager'), (req, res) => {
  const { config_name, vat_percent, service_charge_percent, effective_date, notes } = req.body;

  if (!config_name || !effective_date) {
    return res.status(400).json({ message: 'Config name and effective date are required.' });
  }

  db.run(
    `INSERT INTO tax_service_configs (store_id, config_name, vat_percent, service_charge_percent, effective_date, notes, created_by)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [req.user.store_id, config_name, Number(vat_percent || 0), Number(service_charge_percent || 0), effective_date, notes || null, req.user.id],
    function (err) {
      if (err) return res.status(400).json({ message: 'Unable to create tax config', error: err.message });
      res.status(201).json({ id: this.lastID, config_name, vat_percent, service_charge_percent, effective_date });
    }
  );
});

module.exports = router;
