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
`;

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

async function seedData() {
  const store = await new Promise((resolve, reject) => {
    db.get('SELECT * FROM stores WHERE id = ?', ['demo-store'], (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });

  if (!store) {
    await new Promise((resolve, reject) => {
      db.run(
        `INSERT INTO stores (id, name, owner_id, address, phone, email) VALUES (?, ?, ?, ?, ?, ?)`,
        ['demo-store', 'Demo Restaurant', 1, 'Hanoi', '0900000000', 'demo@lanrestaurant.com'],
        (err) => err ? reject(err) : resolve()
      );
    });
  }

  const user = await new Promise((resolve, reject) => {
    db.get('SELECT * FROM users WHERE username = ?', ['admin'], (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });

  if (!user) {
    const passwordHash = await bcrypt.hash('admin123', 10);
    await new Promise((resolve, reject) => {
      db.run(
        `INSERT INTO users (store_id, username, password_hash, email, role, full_name, is_active, created_by)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        ['demo-store', 'admin', passwordHash, 'admin@lanrestaurant.com', 'owner', 'System Admin', 1, 1],
        (err) => err ? reject(err) : resolve()
      );
    });
  }

  const categoryCount = await new Promise((resolve, reject) => {
    db.get('SELECT COUNT(*) as count FROM categories WHERE store_id = ?', ['demo-store'], (err, row) => {
      if (err) reject(err);
      else resolve(row.count);
    });
  });

  if (categoryCount === 0) {
    const categories = ['Main Dishes', 'Drinks', 'Desserts'];
    for (let i = 0; i < categories.length; i++) {
      await new Promise((resolve, reject) => {
        db.run(
          `INSERT INTO categories (store_id, category_name, display_order) VALUES (?, ?, ?)`,
          ['demo-store', categories[i], i + 1],
          function (err) {
            if (err) reject(err);
            else resolve(this.lastID);
          }
        );
      });
    }
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

    const items = [
      { category: 'Main Dishes', item_code: 'P001', item_name: 'Grilled Chicken', description: 'Signature grilled chicken', base_price: 120000, cost_price: 90000 },
      { category: 'Main Dishes', item_code: 'P002', item_name: 'Beef Noodle Soup', description: 'Hot beef noodles', base_price: 95000, cost_price: 70000 },
      { category: 'Drinks', item_code: 'D001', item_name: 'Fresh Lemon Tea', description: 'Cold tea', base_price: 30000, cost_price: 15000 },
      { category: 'Desserts', item_code: 'S001', item_name: 'Cheesecake', description: 'Creamy dessert', base_price: 50000, cost_price: 25000 },
    ];

    const byCategory = categories.reduce((acc, category) => {
      acc[category.category_name] = category.id;
      return acc;
    }, {});

    for (const item of items) {
      await new Promise((resolve, reject) => {
        db.run(
          `INSERT INTO menu_items (store_id, category_id, item_code, item_name, description, base_price, cost_price)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          ['demo-store', byCategory[item.category], item.item_code, item.item_name, item.description, item.base_price, item.cost_price],
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
    const seedMaterials = [
      ['M001', 'Chicken Breast', 'kg', 25, 8, 90000, 'Local Supplier', 'Fresh chicken'],
      ['M002', 'Rice', 'kg', 40, 10, 25000, 'Local Supplier', 'Cooking rice'],
      ['M003', 'Lemon', 'kg', 15, 3, 20000, 'Fruit Supplier', 'Tea and drinks'],
    ];

    for (const material of seedMaterials) {
      await new Promise((resolve, reject) => {
        db.run(
          `INSERT INTO materials (store_id, material_code, material_name, unit, current_quantity, min_quantity, unit_price, supplier, notes)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          ['demo-store', ...material],
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
    const tables = [
      ['T01', 'Table 1', 2],
      ['T02', 'Table 2', 4],
      ['T03', 'Table 3', 6],
    ];

    for (const table of tables) {
      await new Promise((resolve, reject) => {
        db.run(
          `INSERT INTO table_config (store_id, table_number, table_name, capacity, status)
           VALUES (?, ?, ?, ?, 'available')`,
          ['demo-store', Number(table[0].replace('T', '')), table[1], table[2]],
          (err) => err ? reject(err) : resolve()
        );
      });
    }
  }
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
