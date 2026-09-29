const express = require('express');
const db = require('../config/database');
const auth = require('../middleware/auth');
const authorize = require('../middleware/authorization');

const router = express.Router();

router.get('/', auth, authorize('owner', 'admin', 'manager', 'supervisor', 'staff'), (req, res) => {
  db.all(
    `SELECT m.*, c.category_name
     FROM menu_items m
     LEFT JOIN categories c ON c.id = m.category_id
     WHERE m.store_id = ? AND m.is_active = 1
     ORDER BY c.display_order, m.id`,
    [req.user.store_id],
    (err, items) => {
      if (err) {
        return res.status(500).json({ message: 'Database error', error: err.message });
      }

      db.all(
        `SELECT * FROM categories WHERE store_id = ? AND is_active = 1 ORDER BY display_order`,
        [req.user.store_id],
        (catErr, categories) => {
          if (catErr) {
            return res.status(500).json({ message: 'Database error', error: catErr.message });
          }

          res.json({ categories, items });
        }
      );
    }
  );
});

router.post('/categories', auth, authorize('owner', 'admin', 'manager'), (req, res) => {
  const { category_name, description, display_order } = req.body;

  if (!category_name) {
    return res.status(400).json({ message: 'Category name is required.' });
  }

  db.run(
    `INSERT INTO categories (store_id, category_name, description, display_order) VALUES (?, ?, ?, ?)`,
    [req.user.store_id, category_name, description || null, display_order || 0],
    function (err) {
      if (err) {
        return res.status(400).json({ message: 'Unable to create category', error: err.message });
      }

      res.status(201).json({ id: this.lastID, category_name, description, display_order });
    }
  );
});

router.post('/items', auth, authorize('owner', 'admin', 'manager'), (req, res) => {
  const { category_id, item_code, item_name, description, base_price, cost_price } = req.body;

  if (!category_id || !item_code || !item_name || !base_price) {
    return res.status(400).json({ message: 'Category, item code, item name, and base price are required.' });
  }

  db.run(
    `INSERT INTO menu_items (store_id, category_id, item_code, item_name, description, base_price, cost_price)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [req.user.store_id, category_id, item_code, item_name, description || null, Number(base_price), Number(cost_price || 0)],
    function (err) {
      if (err) {
        return res.status(400).json({ message: 'Unable to create menu item', error: err.message });
      }

      res.status(201).json({ id: this.lastID, item_code, item_name, base_price });
    }
  );
});

module.exports = router;
