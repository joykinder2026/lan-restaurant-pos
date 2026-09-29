const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const db = require('./database');

const schema = `
  CREATE TABLE IF NOT EXISTS stores (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    owner_id INTEGER,
    address TEXT,
    phone TEXT,
    email TEXT,
    is_active BOOLEAN DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    store_id TEXT NOT NULL,
    username TEXT NOT NULL,
    password_hash TEXT NOT NULL,
    email TEXT,
    role TEXT NOT NULL CHECK(role IN ('owner', 'admin', 'manager', 'supervisor', 'staff')),
    full_name TEXT,
    is_active BOOLEAN DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    created_by INTEGER,
    UNIQUE(store_id, username),
    FOREIGN KEY(store_id) REFERENCES stores(id),
    FOREIGN KEY(created_by) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS tax_service_configs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    store_id TEXT NOT NULL,
    config_name TEXT NOT NULL,
    vat_percent REAL NOT NULL DEFAULT 0,
    service_charge_percent REAL NOT NULL DEFAULT 0,
    effective_date DATETIME NOT NULL,
    end_date DATETIME,
    is_active BOOLEAN DEFAULT 1,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    created_by INTEGER,
    FOREIGN KEY(store_id) REFERENCES stores(id),
    FOREIGN KEY(created_by) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    store_id TEXT NOT NULL,
    category_name TEXT NOT NULL,
    description TEXT,
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(store_id, category_name),
    FOREIGN KEY(store_id) REFERENCES stores(id)
  );

  CREATE TABLE IF NOT EXISTS menu_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    store_id TEXT NOT NULL,
    category_id INTEGER NOT NULL,
    item_code TEXT NOT NULL,
    item_name TEXT NOT NULL,
    description TEXT,
    base_price REAL NOT NULL,
    cost_price REAL DEFAULT 0,
    is_active BOOLEAN DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(store_id, item_code),
    FOREIGN KEY(store_id) REFERENCES stores(id),
    FOREIGN KEY(category_id) REFERENCES categories(id)
  );

  CREATE TABLE IF NOT EXISTS materials (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    store_id TEXT NOT NULL,
    material_code TEXT NOT NULL,
    material_name TEXT NOT NULL,
    unit TEXT NOT NULL,
    current_quantity REAL NOT NULL DEFAULT 0,
    min_quantity REAL DEFAULT 0,
    unit_price REAL NOT NULL,
    supplier TEXT,
    notes TEXT,
    is_active BOOLEAN DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(store_id, material_code),
    FOREIGN KEY(store_id) REFERENCES stores(id)
  );

  CREATE TABLE IF NOT EXISTS bom_details (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    store_id TEXT NOT NULL,
    menu_item_id INTEGER NOT NULL,
    material_id INTEGER NOT NULL,
    quantity_needed REAL NOT NULL,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(menu_item_id, material_id),
    FOREIGN KEY(store_id) REFERENCES stores(id),
    FOREIGN KEY(menu_item_id) REFERENCES menu_items(id),
    FOREIGN KEY(material_id) REFERENCES materials(id)
  );

  CREATE TABLE IF NOT EXISTS table_config (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    store_id TEXT NOT NULL,
    table_number INTEGER NOT NULL,
    table_name TEXT NOT NULL,
    capacity INTEGER DEFAULT 2,
    status TEXT DEFAULT 'available' CHECK(status IN ('available', 'occupied', 'waiting_payment', 'maintenance')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(store_id, table_number),
    FOREIGN KEY(store_id) REFERENCES stores(id)
  );

  CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    store_id TEXT NOT NULL,
    order_number TEXT NOT NULL UNIQUE,
    table_id INTEGER NOT NULL,
    order_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    status TEXT DEFAULT 'new' CHECK(status IN ('new', 'in_progress', 'ready', 'completed', 'cancelled')),
    subtotal REAL NOT NULL DEFAULT 0,
    vat_percent REAL NOT NULL DEFAULT 0,
    vat_amount REAL NOT NULL DEFAULT 0,
    service_charge_percent REAL NOT NULL DEFAULT 0,
    service_charge_amount REAL NOT NULL DEFAULT 0,
    total REAL NOT NULL DEFAULT 0,
    tax_service_config_id INTEGER,
    staff_id INTEGER NOT NULL,
    notes TEXT,
    cancelled_at DATETIME,
    cancelled_by INTEGER,
    cancel_reason TEXT,
    completed_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(store_id) REFERENCES stores(id),
    FOREIGN KEY(table_id) REFERENCES table_config(id),
    FOREIGN KEY(staff_id) REFERENCES users(id),
    FOREIGN KEY(cancelled_by) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS order_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id INTEGER NOT NULL,
    menu_item_id INTEGER NOT NULL,
    quantity INTEGER NOT NULL,
    unit_price REAL NOT NULL,
    note TEXT,
    status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'preparing', 'ready', 'served', 'cancelled')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(order_id) REFERENCES orders(id),
    FOREIGN KEY(menu_item_id) REFERENCES menu_items(id)
  );

  CREATE TABLE IF NOT EXISTS payments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    store_id TEXT NOT NULL,
    order_id INTEGER NOT NULL UNIQUE,
    payment_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    amount REAL NOT NULL,
    payment_method TEXT NOT NULL CHECK(payment_method IN ('cash', 'card', 'transfer', 'other')),
    reference_number TEXT,
    notes TEXT,
    received_by INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(store_id) REFERENCES stores(id),
    FOREIGN KEY(order_id) REFERENCES orders(id),
    FOREIGN KEY(received_by) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS daily_expenses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    store_id TEXT NOT NULL,
    expense_date DATE NOT NULL,
    category TEXT NOT NULL,
    description TEXT NOT NULL,
    amount REAL NOT NULL,
    paid_by INTEGER NOT NULL,
    receipt_number TEXT,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(store_id) REFERENCES stores(id),
    FOREIGN KEY(paid_by) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS audit_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    store_id TEXT NOT NULL,
    user_id INTEGER NOT NULL,
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id INTEGER,
    old_value TEXT,
    new_value TEXT,
    reason TEXT,
    ip_address TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(store_id) REFERENCES stores(id),
    FOREIGN KEY(user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS role_permissions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    role TEXT NOT NULL PRIMARY KEY,
    can_view_menu BOOLEAN DEFAULT 0,
    can_create_order BOOLEAN DEFAULT 0,
    can_edit_order BOOLEAN DEFAULT 0,
    can_delete_order BOOLEAN DEFAULT 0,
    can_payment BOOLEAN DEFAULT 0,
    can_manage_materials BOOLEAN DEFAULT 0,
    can_manage_users BOOLEAN DEFAULT 0,
    can_view_reports BOOLEAN DEFAULT 0,
    can_manage_config BOOLEAN DEFAULT 0,
    can_view_audit_log BOOLEAN DEFAULT 0
  );
`;

async function seedData() {
  const storeExists = await new Promise((resolve, reject) => {
    db.get('SELECT id FROM stores WHERE id = ?', ['demo-store'], (err, row) => {
      if (err) reject(err);
      else resolve(Boolean(row));
    });
  });

  if (!storeExists) {
    await new Promise((resolve, reject) => {
      db.run(
        `INSERT INTO stores (id, name, owner_id, address, phone, email) VALUES (?, ?, ?, ?, ?, ?)`,
        ['demo-store', 'LAN Restaurant', 1, 'Hanoi, Vietnam', '0900 000 000', 'demo@lanrestaurant.vn'],
        (err) => err ? reject(err) : resolve()
      );
    });
  }

  const adminExists = await new Promise((resolve, reject) => {
    db.get('SELECT id FROM users WHERE username = ?', ['admin'], (err, row) => {
      if (err) reject(err);
      else resolve(Boolean(row));
    });
  });

  if (!adminExists) {
    const passwordHash = await bcrypt.hash('admin123', 10);
    await new Promise((resolve, reject) => {
      db.run(
        `INSERT INTO users (store_id, username, password_hash, email, role, full_name, is_active, created_by)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        ['demo-store', 'admin', passwordHash, 'admin@lanrestaurant.vn', 'owner', 'System Admin', 1, 1],
        (err) => err ? reject(err) : resolve()
      );
    });
  }

  const menuCount = await new Promise((resolve, reject) => {
    db.get('SELECT COUNT(*) as count FROM menu_items WHERE store_id = ?', ['demo-store'], (err, row) => {
      if (err) reject(err);
      else resolve(row.count);
    });
  });

  if (menuCount === 0) {
    const categories = await new Promise((resolve, reject) => {
      db.all('SELECT * FROM categories WHERE store_id = ? ORDER BY display_order', ['demo-store'], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });

    if (!categories.length) {
      const defaultCategories = ['Appetizers', 'Main Dishes', 'Drinks', 'Desserts'];
      for (let i = 0; i < defaultCategories.length; i++) {
        await new Promise((resolve, reject) => {
          db.run('INSERT INTO categories (store_id, category_name, display_order) VALUES (?, ?, ?)', ['demo-store', defaultCategories[i], i + 1], (err) => err ? reject(err) : resolve());
        });
      }
    }

    const categoryMap = await new Promise((resolve, reject) => {
      db.all('SELECT * FROM categories WHERE store_id = ? ORDER BY display_order', ['demo-store'], (err, rows) => {
        if (err) reject(err);
        else resolve(rows.reduce((acc, row) => { acc[row.category_name] = row.id; return acc; }, {}));
      });
    });

    const items = [
      ['A001', 'Spring Rolls', 'Appetizers', 45000, 22000],
      ['P001', 'Grilled Chicken', 'Main Dishes', 120000, 82000],
      ['P002', 'Beef Noodle Soup', 'Main Dishes', 95000, 65000],
      ['D001', 'Fresh Lemon Tea', 'Drinks', 30000, 14000],
      ['S001', 'Cheesecake', 'Desserts', 50000, 26000],
    ];

    for (const item of items) {
      await new Promise((resolve, reject) => {
        db.run(
          `INSERT INTO menu_items (store_id, category_id, item_code, item_name, description, base_price, cost_price)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          ['demo-store', categoryMap[item[2]], item[0], item[1], `Prepared with fresh ingredients`, item[3], item[4]],
          (err) => err ? reject(err) : resolve()
        );
      });
    }
  }

  const materialCount = await new Promise((resolve, reject) => {
    db.get('SELECT COUNT(*) as count FROM materials WHERE store_id = ?', ['demo-store'], (err, row) => {
      if (err) reject(err);
      else resolve(row.count);
    });
  });

  if (materialCount === 0) {
    const materials = [
      ['M001', 'Chicken Breast', 'kg', 25, 8, 90000, 'Local Supplier', 'Fresh chicken'],
      ['M002', 'Rice', 'kg', 60, 12, 26000, 'Local Supplier', 'Cooking rice'],
      ['M003', 'Lemon', 'kg', 15, 3, 22000, 'Fruit Supplier', 'Tea and drinks'],
      ['M004', 'Spring Rolls Wrappers', 'pack', 40, 10, 18000, 'Bakery Supplier', 'Appetizer wrapper'],
    ];

    for (const mat of materials) {
      await new Promise((resolve, reject) => {
        db.run(
          `INSERT INTO materials (store_id, material_code, material_name, unit, current_quantity, min_quantity, unit_price, supplier, notes)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          ['demo-store', ...mat],
          (err) => err ? reject(err) : resolve()
        );
      });
    }
  }

  const tableCount = await new Promise((resolve, reject) => {
    db.get('SELECT COUNT(*) as count FROM table_config WHERE store_id = ?', ['demo-store'], (err, row) => {
      if (err) reject(err);
      else resolve(row.count);
    });
  });

  if (tableCount === 0) {
    const tableList = [
      [1, 'Table 1', 2],
      [2, 'Table 2', 4],
      [3, 'Table 3', 6],
      [4, 'Table 4', 4],
    ];

    for (const t of tableList) {
      await new Promise((resolve, reject) => {
        db.run(
          `INSERT INTO table_config (store_id, table_number, table_name, capacity, status)
           VALUES (?, ?, ?, ?, 'available')`,
          ['demo-store', t[0], t[1], t[2]],
          (err) => err ? reject(err) : resolve()
        );
      });
    }
  }

  const taxConfigExists = await new Promise((resolve, reject) => {
    db.get('SELECT id FROM tax_service_configs WHERE store_id = ? AND config_name = ?', ['demo-store', 'Default VAT + Service'], (err, row) => {
      if (err) reject(err);
      else resolve(Boolean(row));
    });
  });

  if (!taxConfigExists) {
    await new Promise((resolve, reject) => {
      db.run(
        `INSERT INTO tax_service_configs (store_id, config_name, vat_percent, service_charge_percent, effective_date, created_by)
         VALUES (?, ?, ?, ?, datetime('now'), ?)`,
        ['demo-store', 'Default VAT + Service', 10, 5, 1],
        (err) => err ? reject(err) : resolve()
      );
    });
  }
}

function runSchema() {
  return new Promise((resolve, reject) => {
    db.exec(schema, async (err) => {
      if (err) {
        reject(err);
        return;
      }

      try {
        await seedData();
        resolve();
      } catch (seedErr) {
        reject(seedErr);
      }
    });
  });
}

async function initializeDatabase() {
  try {
    await runSchema();
    console.log('Database initialized successfully.');
  } catch (error) {
    console.error('Failed to initialize database:', error.message);
    process.exit(1);
  }
}

module.exports = { initializeDatabase };
