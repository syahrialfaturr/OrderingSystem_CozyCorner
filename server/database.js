const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'cozycorner.db');
let db;

const init = () => {
  db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
      console.error('Error opening database:', err.message);
    } else {
      console.log('Connected to SQLite database');
      createTables();
      seedInitialData();
    }
  });
};

const createTables = () => {
  // Menu items table
  db.run(`CREATE TABLE IF NOT EXISTS menu_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    price REAL NOT NULL,
    image_url TEXT,
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // Stock table
  db.run(`CREATE TABLE IF NOT EXISTS stock (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    menu_item_id INTEGER NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 0,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(menu_item_id, date),
    FOREIGN KEY (menu_item_id) REFERENCES menu_items(id)
  )`);

  // Orders table
  db.run(`CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_number TEXT UNIQUE NOT NULL,
    order_type TEXT NOT NULL DEFAULT 'cashier',
    status TEXT NOT NULL DEFAULT 'pending',
    total_amount REAL NOT NULL,
    payment_method TEXT DEFAULT 'cash',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    completed_at DATETIME
  )`);

  // Order items table
  db.run(`CREATE TABLE IF NOT EXISTS order_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id INTEGER NOT NULL,
    menu_item_id INTEGER NOT NULL,
    quantity INTEGER NOT NULL,
    price REAL NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders(id),
    FOREIGN KEY (menu_item_id) REFERENCES menu_items(id)
  )`);

  // Daily revenue table
  db.run(`CREATE TABLE IF NOT EXISTS daily_revenue (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date DATE UNIQUE NOT NULL,
    total_revenue REAL NOT NULL DEFAULT 0,
    total_orders INTEGER NOT NULL DEFAULT 0,
    cash_received REAL DEFAULT 0,
    verified BOOLEAN DEFAULT 0,
    verified_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);
};

const seedInitialData = () => {
  // Check if menu items already exist
  db.get('SELECT COUNT(*) as count FROM menu_items', (err, row) => {
    if (err) {
      console.error('Error checking menu items:', err);
      return;
    }

    if (row.count === 0) {
      const menuItems = [
        // Coffee
        { name: 'Americano', category: 'Coffee', price: 25000, description: 'Espresso encer dengan rasa kopi murni' },
        { name: 'Cappuccino', category: 'Coffee', price: 30000, description: 'Perpaduan espresso, susu, dan foam lembut' },
        { name: 'Latte', category: 'Coffee', price: 32000, description: 'Espresso dengan susu creamy yang lembut' },
        // Non Coffee
        { name: 'Iced Tea', category: 'Non Coffee', price: 15000, description: 'Teh dingin klasik dan menyegarkan' },
        { name: 'Iced Lemon Tea', category: 'Non Coffee', price: 18000, description: 'Teh dingin segar dengan perasan lemon' },
        { name: 'Iced Chocolate', category: 'Non Coffee', price: 20000, description: 'Cokelat dingin manis dan creamy' },
        { name: 'Iced Matcha', category: 'Non Coffee', price: 25000, description: 'Matcha dingin creamy dan lembut' },
        // Food
        { name: 'French Fries', category: 'Food', price: 20000, description: 'Kentang goreng renyah dan gurih' },
        { name: 'Ayam Geprek', category: 'Food', price: 25000, description: 'Ayam goreng geprek dengan sambal mantap' },
        { name: 'Nasi Goreng', category: 'Food', price: 22000, description: 'Nasi goreng hangat dengan cita rasa klasik' },
        { name: 'Donut', category: 'Food', price: 15000, description: 'Donat lembut dengan topping manis' }
      ];

      const stmt = db.prepare('INSERT INTO menu_items (name, category, price, description) VALUES (?, ?, ?, ?)');
      
      menuItems.forEach(item => {
        stmt.run(item.name, item.category, item.price, item.description);
      });

      stmt.finalize((err) => {
        if (err) {
          console.error('Error seeding menu items:', err);
        } else {
          console.log('Menu items seeded successfully');
          // Initialize stock for today
          initializeTodayStock();
        }
      });
    }
  });
};

const initializeTodayStock = () => {
  const today = new Date().toISOString().split('T')[0];
  
  db.all('SELECT id FROM menu_items', (err, items) => {
    if (err) {
      console.error('Error fetching menu items for stock:', err);
      return;
    }

    items.forEach(item => {
      db.run(
        'INSERT OR IGNORE INTO stock (menu_item_id, quantity, date) VALUES (?, ?, ?)',
        [item.id, 50, today],
        (err) => {
          if (err) console.error('Error initializing stock:', err);
        }
      );
    });
  });
};

const getDb = () => db;

module.exports = { init, getDb };
