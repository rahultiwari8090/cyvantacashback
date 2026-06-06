import express from 'express';
import db from '../config/db.js';

const router = express.Router();

// GET /api/analytics/clicks
router.get('/clicks', async (req, res) => {
  try {
    const clicks = await db.getCollection('clicks');
    res.json(clicks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/analytics/conversions
router.get('/conversions', async (req, res) => {
  try {
    const conversions = await db.getCollection('conversions');
    res.json(conversions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/analytics/conversions/:id/adjust
router.put('/conversions/:id/adjust', async (req, res) => {
  try {
    const { id } = req.params;
    const { amount, type } = req.body;

    if (amount === undefined || !type) {
      return res.status(400).json({ error: 'amount and type (credit/debit) are required' });
    }

    const conversions = await db.getCollection('conversions');
    const finance = await db.getCollection('finance');

    const index = conversions.findIndex(c => c.id === id);
    if (index === -1) {
      return res.status(404).json({ error: 'Conversion not found' });
    }

    const conversion = conversions[index];
    const oldCommission = Number(conversion.commission);
    const newCommission = Number(amount);
    const nextStatus = type === 'credit' ? 'approved' : 'rejected';

    conversion.commission = newCommission;
    conversion.status = nextStatus;

    if (type === 'credit') {
      // Add the difference/new amount to revenue depending on how frontend calculates
      // Simple mockup logic: just add amount if credit, subtract if debit
      finance.totalRevenue = Number((finance.totalRevenue + newCommission).toFixed(2));
    } else {
      finance.totalRevenue = Number(Math.max(0, finance.totalRevenue - newCommission).toFixed(2));
    }

    await db.saveCollection('conversions');
    await db.saveCollection('finance');

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
