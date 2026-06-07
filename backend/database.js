const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'cyvanta.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database', err.message);
  } else {
    console.log('Connected to the SQLite database.');
    db.run('PRAGMA foreign_keys = ON');
    initDb();
  }
});

function initDb() {
  db.serialize(() => {
    // Users Table
    db.run(`CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT,
      email TEXT,
      phone TEXT,
      referralCode TEXT,
      referredBy TEXT,
      joinDate TEXT,
      status TEXT,
      sharedCommissionRate REAL,
      wallet_confirmed REAL DEFAULT 0,
      wallet_pending REAL DEFAULT 0,
      wallet_referral REAL DEFAULT 0
    )`);

    // Products Table
    db.run(`CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY,
      name TEXT,
      platform TEXT,
      price REAL,
      cashbackValue REAL,
      image TEXT,
      status TEXT
    )`);

    // Tracked Orders
    db.run(`CREATE TABLE IF NOT EXISTS tracked_orders (
      id TEXT PRIMARY KEY,
      userId TEXT,
      userName TEXT,
      productId TEXT,
      productName TEXT,
      platform TEXT,
      price REAL,
      cashbackAmount REAL,
      status TEXT,
      orderDate TEXT,
      confirmedDate TEXT,
      shippedDate TEXT,
      deliveredDate TEXT,
      returnExpiryDate TEXT,
      returnWindowDays INTEGER,
      cashbackId TEXT
    )`);

    // Withdraw Requests
    db.run(`CREATE TABLE IF NOT EXISTS withdraw_requests (
      id TEXT PRIMARY KEY,
      userName TEXT,
      coins INTEGER,
      amount REAL,
      upiId TEXT,
      status TEXT,
      date TEXT
    )`);

    // Seed mock data if empty
    db.get('SELECT count(*) as count FROM products', [], (err, row) => {
      if (err) return console.error(err);
      if (row.count === 0) {
        seedData();
      }
    });
  });
}

function seedData() {
  console.log('Seeding initial data...');
  const stmtProd = db.prepare('INSERT INTO products (id, name, platform, price, cashbackValue, image, status) VALUES (?, ?, ?, ?, ?, ?, ?)');
  
  const mockProducts = [
    { id: '1', name: 'boAt Rockerz 450 Bluetooth Headphones', platform: 'Amazon', price: 29.99, cashbackValue: 10.0, image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300', status: 'active' },
    { id: '2', name: 'Adidas UltraBoost 22 Running Shoes', platform: 'Myntra', price: 110.00, cashbackValue: 12.0, image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=300', status: 'active' },
    { id: '3', name: 'HP Pavilion Touchscreen Laptop', platform: 'Flipkart', price: 549.99, cashbackValue: 8.5, image: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=300', status: 'active' },
    { id: '4', name: 'Cetaphil Daily Facial Cleanser', platform: 'Nykaa Beauty', price: 14.99, cashbackValue: 7.0, image: 'https://images.unsplash.com/photo-1608248597481-496100c8c836?w=300', status: 'inactive' }
  ];

  for (const p of mockProducts) {
    stmtProd.run(p.id, p.name, p.platform, p.price, p.cashbackValue, p.image, p.status);
  }
  stmtProd.finalize();

  const stmtUser = db.prepare('INSERT INTO users (id, name, email, phone, referralCode, referredBy, joinDate, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)');
  const mockUsers = [
    { id: 'u1', name: 'Rahul Sharma', email: 'rahul.sharma@gmail.com', phone: '+91 9876543210', referralCode: 'RAHUL50', referredBy: 'None', joinDate: '2026-04-12', status: 'active' },
    { id: 'u2', name: 'Sneha Patel', email: 'sneha.patel@gmail.com', phone: '+91 8765432109', referralCode: 'SNEHA12', referredBy: 'RAHUL50', joinDate: '2026-04-18', status: 'active' }
  ];
  for (const u of mockUsers) {
    stmtUser.run(u.id, u.name, u.email, u.phone, u.referralCode, u.referredBy, u.joinDate, u.status);
  }
  stmtUser.finalize();
  
  console.log('Seeding complete.');
}

module.exports = db;
