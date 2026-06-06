import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Import routes
import usersRouter from './routes/users.js';
import productsRouter from './routes/products.js';
import trackingRouter from './routes/tracking.js';
import cashbackRouter from './routes/cashback.js';
import withdrawalsRouter from './routes/withdrawals.js';
import analyticsRouter from './routes/analytics.js';
import financeRouter from './routes/finance.js';
import settingsRouter from './routes/settings.js';
import sharedLinksRouter from './routes/sharedLinks.js';
import sharedCommissionsRouter from './routes/sharedCommissions.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 8080;

// Middleware
app.use(cors());
app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Base/Healthcheck route
app.get('/', (req, res) => {
  res.json({
    status: 'online',
    message: 'Cyvanta Affiliate Marketing Backend is running',
    timestamp: new Date().toISOString()
  });
});

// Bind routes under /api prefix
app.use('/api/users', usersRouter);
app.use('/api/products', productsRouter);
app.use('/api/tracking', trackingRouter);
app.use('/api/cashback', cashbackRouter);
app.use('/api/withdrawals', withdrawalsRouter);
app.use('/api/analytics', analyticsRouter);
app.use('/api/finance', financeRouter);
app.use('/api/settings', settingsRouter);
app.use('/api/shared-links', sharedLinksRouter);
app.use('/api/shared-commissions', sharedCommissionsRouter);

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('[Error Handler] caught error:', err);
  res.status(500).json({ error: err.message || 'Internal Server Error' });
});

// Start Server
app.listen(PORT, () => {
  console.log(`=========================================`);
  console.log(`Server is running on: http://localhost:${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`Ready to handle requests.`);
  console.log(`=========================================`);
});
