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

    // Stores Table
    db.run(`CREATE TABLE IF NOT EXISTS stores (
      id TEXT PRIMARY KEY,
      name TEXT,
      logo TEXT,
      cashbackRate TEXT,
      description TEXT,
      category TEXT,
      isPopular INTEGER,
      status TEXT
    )`);

    // Deals Table
    db.run(`CREATE TABLE IF NOT EXISTS deals (
      id TEXT PRIMARY KEY,
      name TEXT,
      image TEXT,
      offerText TEXT,
      link TEXT,
      cashback TEXT,
      status TEXT,
      comparisons TEXT -- Store as JSON string
    )`);

    // Banners Table
    db.run(`CREATE TABLE IF NOT EXISTS banners (
      id TEXT PRIMARY KEY,
      image TEXT,
      title TEXT,
      subtitle TEXT,
      link TEXT,
      status TEXT
    )`);

    // Categories Table
    db.run(`CREATE TABLE IF NOT EXISTS categories (
      id TEXT PRIMARY KEY,
      name TEXT,
      icon TEXT,
      status TEXT,
      createdAt TEXT
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
    { id: '4', name: 'Cetaphil Daily Facial Cleanser', platform: 'Nykaa Beauty', price: 14.99, cashbackValue: 7.0, image: 'https://images.unsplash.com/photo-1608248597481-496100c8c836?w=300', status: 'active' }
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

  const stmtStore = db.prepare('INSERT INTO stores (id, name, logo, cashbackRate, description, category, isPopular, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)');
  const mockStores = [
    { id: 'amazon', name: 'Amazon', logo: 'https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg', cashbackRate: '10%', description: 'Shop groceries, home equipment, kitchen essentials, and electronics with special cash bonuses.', category: 'grocery', isPopular: 1, status: 'active' },
    { id: 'myntra', name: 'Myntra', logo: 'https://upload.wikimedia.org/wikipedia/commons/b/bc/Myntra_Logo.png', cashbackRate: '12%', description: 'Explore trendy lifestyle collections, designer clothes, sports sneakers, and cosmetics.', category: 'fashion', isPopular: 1, status: 'active' },
    { id: 'flipkart', name: 'Flipkart', logo: 'https://upload.wikimedia.org/wikipedia/commons/7/7a/Flipkart_logo.svg', cashbackRate: '8.5%', description: 'Leading platform for mobile electronics, large home appliances, books, and home decors.', category: 'electronics', isPopular: 1, status: 'active' },
    { id: 'ajio', name: 'Ajio', logo: 'https://upload.wikimedia.org/wikipedia/commons/c/c9/Ajio_Logo.svg', cashbackRate: '15%', description: 'Sleek luxury fashion and handpicked streetwear brands from independent designers.', category: 'fashion', isPopular: 1, status: 'active' },
    { id: 'nykaa', name: 'Nykaa Beauty', logo: 'https://upload.wikimedia.org/wikipedia/commons/5/5b/Nykaa_Logo.svg', cashbackRate: '7%', description: 'Premium cosmetic brands, organic lipsticks, haircare, and skin treatment formulas.', category: 'health', isPopular: 0, status: 'active' },
    { id: 'makemytrip', name: 'MakeMyTrip', logo: 'https://upload.wikimedia.org/wikipedia/commons/f/fb/MakeMyTrip_Logo.svg', cashbackRate: '9%', description: 'Book domestic flights, international vacations, hotels, and intercity cab packages.', category: 'travel', isPopular: 0, status: 'active' }
  ];
  for (const s of mockStores) {
    stmtStore.run(s.id, s.name, s.logo, s.cashbackRate, s.description, s.category, s.isPopular, s.status);
  }
  stmtStore.finalize();

  const stmtDeal = db.prepare('INSERT INTO deals (id, name, image, offerText, link, cashback, status, comparisons) VALUES (?, ?, ?, ?, ?, ?, ?, ?)');
  const mockDeals = [
    {
      id: 'd1',
      name: 'boAt Rockerz 450 Bluetooth On-Ear Headphones with Mic',
      image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300',
      offerText: 'Up to 50% Off',
      link: 'https://amazon.in/dp/example',
      cashback: '10%',
      status: 'active',
      comparisons: JSON.stringify([{ platform: 'Amazon', listedPrice: 29.99, cashbackPercent: 10.0, link: 'https://amazon.in/dp/example' }])
    },
    {
      id: 'd2',
      name: 'Adidas UltraBoost 22 Performance Athletic Sports Shoes',
      image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=300',
      offerText: 'Flat 30% Off',
      link: 'https://myntra.com/shoes/example',
      cashback: '12%',
      status: 'active',
      comparisons: JSON.stringify([{ platform: 'Myntra', listedPrice: 110.00, cashbackPercent: 12.0, link: 'https://myntra.com/shoes/example' }])
    }
  ];
  for (const d of mockDeals) {
    stmtDeal.run(d.id, d.name, d.image, d.offerText, d.link, d.cashback, d.status, d.comparisons);
  }
  stmtDeal.finalize();

  const stmtBanner = db.prepare('INSERT INTO banners (id, image, title, subtitle, link, status) VALUES (?, ?, ?, ?, ?, ?)');
  const mockBanners = [
    { id: 'b1', image: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=800', title: 'Summer Sale is Live!', subtitle: 'Get up to 80% off on top brands', link: '/stores', status: 'active' },
    { id: 'b2', image: 'https://images.unsplash.com/photo-1607082349566-187342175e2f?w=800', title: 'Exclusive Electronics Deals', subtitle: 'Extra 10% cashback on laptops', link: '/category/electronics', status: 'active' }
  ];
  for (const b of mockBanners) {
    stmtBanner.run(b.id, b.image, b.title, b.subtitle, b.link, b.status);
  }
  stmtBanner.finalize();

  const stmtCat = db.prepare('INSERT INTO categories (id, name, icon, status, createdAt) VALUES (?, ?, ?, ?, ?)');
  const mockCats = [
    { id: '1', name: 'Electronics', icon: 'Smartphone', status: 'active', createdAt: new Date().toISOString() },
    { id: '2', name: 'Fashion', icon: 'Shirt', status: 'active', createdAt: new Date().toISOString() },
    { id: '3', name: 'Health', icon: 'Heart', status: 'active', createdAt: new Date().toISOString() },
    { id: '4', name: 'Travel', icon: 'Plane', status: 'active', createdAt: new Date().toISOString() }
  ];
  for (const c of mockCats) {
    stmtCat.run(c.id, c.name, c.icon, c.status, c.createdAt);
  }
  stmtCat.finalize();

  console.log('Seeding complete.');
}

module.exports = db;
