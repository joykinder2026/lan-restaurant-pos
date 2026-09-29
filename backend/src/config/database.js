const path = require('path');
const fs = require('fs');
const sqlite3 = require('sqlite3').verbose();

const dbDir = path.join(__dirname, '..', '..', 'database');
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const dbPath = process.env.DB_PATH
  ? path.resolve(__dirname, process.env.DB_PATH)
  : path.join(dbDir, 'lan_restaurant_pos.db');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Failed to connect to SQLite database:', err.message);
    process.exit(1);
  }
  console.log(`Connected to SQLite database at ${dbPath}`);
});

module.exports = db;
