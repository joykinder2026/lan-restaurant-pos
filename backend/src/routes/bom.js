const express = require('express');
const db = require('../config/database');
const auth = require('../middleware/auth');
const authorize = require('../middleware/authorization');

const router = express.Router();

router.get('/', auth, authorize('owner', 'admin', 'manager', 'supervisor', 'staff'), (req, res) => {
  db.all(
    `SELECT b.id, b.store_id, b.menu_item_id, b.material_id, b.quantity_needed, b.notes,
            mi.item_name,
            m.material_name, m.unit
     FROM bom_details b
     LEFT JOIN menu_items mi ON mi.id = b.menu_item_id
     LEFT JOIN materials m ON m.id = b.material_id
     WHERE b.store_id = ?
     ORDER BY mi.item_name`,
    [req.user.store_id],
    (err, rows) => {
      if (err) return res.status(500).json({ message: 'Database error', error: err.message });
      res.json(rows);
    }
  );
});

router.post('/', auth, authorize('owner', 'admin', 'manager'), (req, res) => {
  const { menu_item_id, material_id, quantity_needed, notes } = req.body;

  if (!menu_item_id || !material_id || !quantity_needed) {
    return res.status(400).json({ message: 'Menu item, material, and quantity are required.' });
  }

  db.run(
    `INSERT INTO bom_details (store_id, menu_item_id, material_id, quantity_needed, notes)
     VALUES (?, ?, ?, ?, ?)`,
    [req.user.store_id, menu_item_id, material_id, Number(quantity_needed), notes || null],
    function (err) {
      if (err) return res.status(400).json({ message: 'Unable to add BOM item', error: err.message });
      res.status(201).json({ id: this.lastID, menu_item_id, material_id, quantity_needed });
    }
  );
});

module.exports = router;
