const express = require('express');
const cors = require('cors');
const db = require('./database');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 8080;

app.use(cors());
app.use(express.json());

// Root path handler: Automatically redirect to Frontend
app.get('/', (req, res) => {
  res.redirect('http://localhost:8082');
});

// --- PRODUCTS API ---
app.get('/api/products', (req, res) => {
  db.all('SELECT * FROM products', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.post('/api/products', (req, res) => {
  const { name, platform, price, cashbackValue, image, status } = req.body;
  const id = Date.now().toString();
  const sql = 'INSERT INTO products (id, name, platform, price, cashbackValue, image, status) VALUES (?, ?, ?, ?, ?, ?, ?)';
  db.run(sql, [id, name, platform, price, cashbackValue, image, status || 'active'], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ id, name, platform, price, cashbackValue, image, status: status || 'active' });
  });
});

app.post('/api/products/bulk', (req, res) => {
  const productsList = req.body;
  if (!Array.isArray(productsList)) return res.status(400).json({ error: 'Expected array of products' });

  const stmt = db.prepare('INSERT INTO products (id, name, platform, price, cashbackValue, image, status) VALUES (?, ?, ?, ?, ?, ?, ?)');
  const addedProducts = [];
  
  db.serialize(() => {
    db.run('BEGIN TRANSACTION');
    productsList.forEach((prod, index) => {
      const id = (Date.now() + index).toString();
      const status = prod.status || 'active';
      stmt.run(id, prod.name, prod.platform, prod.price, prod.cashbackValue, prod.image, status);
      addedProducts.push({ ...prod, id, status });
    });
    stmt.finalize();
    db.run('COMMIT', (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(addedProducts);
    });
  });
});

app.put('/api/products/:id', (req, res) => {
  const id = req.params.id;
  const { name, platform, price, cashbackValue, image, status } = req.body;
  const sql = 'UPDATE products SET name = ?, platform = ?, price = ?, cashbackValue = ?, image = ?, status = ? WHERE id = ?';
  db.run(sql, [name, platform, price, cashbackValue, image, status, id], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ id, name, platform, price, cashbackValue, image, status });
  });
});

app.delete('/api/products/:id', (req, res) => {
  const id = req.params.id;
  db.run('DELETE FROM products WHERE id = ?', id, function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true });
  });
});

// --- STUBS FOR OTHER ENDPOINTS TO PREVENT FRONTEND CRASH ---
app.get('/api/users', (req, res) => {
  db.all('SELECT * FROM users', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.post('/api/users/login', (req, res) => {
  const { name, email } = req.body;
  if (!email) return res.status(400).json({ error: 'Email required' });
  
  db.get('SELECT * FROM users WHERE email = ?', [email], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    
    if (row) {
      // User exists
      res.json(row);
    } else {
      // Create new user
      const id = 'u' + Date.now();
      const phone = '+91 0000000000';
      const referralCode = name.substring(0, 4).toUpperCase() + Math.floor(100 + Math.random() * 900);
      const joinDate = new Date().toISOString().split('T')[0];
      
      const sql = 'INSERT INTO users (id, name, email, phone, referralCode, referredBy, joinDate, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)';
      db.run(sql, [id, name, email, phone, referralCode, 'None', joinDate, 'active'], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ id, name, email, phone, referralCode, referredBy: 'None', joinDate, status: 'active' });
      });
    }
  });
});

app.get('/api/tracking', (req, res) => {
  db.all('SELECT * FROM tracked_orders', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.post('/api/tracking', (req, res) => {
  const { userId, userName, productId, productName, platform, price, cashbackAmount, status, orderDate, returnWindowDays } = req.body;
  const id = 'TRK' + Math.floor(10000000 + Math.random() * 90000000);
  const cashbackId = 'cb' + Date.now();
  
  const sql = `INSERT INTO tracked_orders 
    (id, userId, userName, productId, productName, platform, price, cashbackAmount, status, orderDate, returnWindowDays, cashbackId) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    
  db.run(sql, [id, userId, userName, productId, productName, platform, price, cashbackAmount, status, orderDate, returnWindowDays, cashbackId], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ id, userId, userName, productId, productName, platform, price, cashbackAmount, status, orderDate, returnWindowDays, cashbackId });
  });
});

app.put('/api/tracking/:id/status', (req, res) => {
  const id = req.params.id;
  const { status, confirmedDate, shippedDate, deliveredDate, returnExpiryDate } = req.body;
  
  const updates = [];
  const params = [];
  
  if (status !== undefined) { updates.push('status = ?'); params.push(status); }
  if (confirmedDate !== undefined) { updates.push('confirmedDate = ?'); params.push(confirmedDate); }
  if (shippedDate !== undefined) { updates.push('shippedDate = ?'); params.push(shippedDate); }
  if (deliveredDate !== undefined) { updates.push('deliveredDate = ?'); params.push(deliveredDate); }
  if (returnExpiryDate !== undefined) { updates.push('returnExpiryDate = ?'); params.push(returnExpiryDate); }
  
  if (updates.length === 0) return res.json({ id });
  
  params.push(id);
  const sql = `UPDATE tracked_orders SET ${updates.join(', ')} WHERE id = ?`;
  
  db.run(sql, params, function(err) {
    if (err) return res.status(500).json({ error: err.message });
    
    // Fetch the updated row to return it
    db.get('SELECT * FROM tracked_orders WHERE id = ?', [id], (err, row) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(row);
    });
  });
});

app.get('/api/withdrawals', (req, res) => {
  db.all('SELECT * FROM withdraw_requests', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.get('/api/shared-links', (req, res) => res.json([]));
app.get('/api/shared-commissions', (req, res) => res.json([]));
app.get('/api/analytics/clicks', (req, res) => res.json([]));
app.get('/api/analytics/conversions', (req, res) => res.json([]));
app.get('/api/cashback', (req, res) => res.json([]));
app.get('/api/finance', (req, res) => res.json({ totalRevenue: 0, totalCashbackPaid: 0, totalWithdrawPaid: 0, pendingWithdrawals: 0, transactions: [] }));
app.get('/api/settings', (req, res) => res.json({ cashbackPercent: 8.0, holdDays: 30, minimumWithdrawal: 10.00, sharedCommissionPercent: 5.0, sharedCommissionHoldDays: 30 }));


app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
