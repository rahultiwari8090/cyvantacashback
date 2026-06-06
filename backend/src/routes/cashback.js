import express from 'express';
import db from '../config/db.js';

const router = express.Router();

// GET /api/cashback
router.get('/', async (req, res) => {
  try {
    const cashback = await db.getCollection('cashback');
    res.json(cashback);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/cashback/:id/approve
router.put('/:id/approve', async (req, res) => {
  try {
    const { id } = req.params;
    const { amount } = req.body;

    if (amount === undefined) {
      return res.status(400).json({ error: 'Amount is required to approve cashback' });
    }

    const cashback = await db.getCollection('cashback');
    const finance = await db.getCollection('finance');
    const index = cashback.findIndex(c => c.id === id);

    if (index === -1) {
      return res.status(404).json({ error: 'Cashback record not found' });
    }

    const item = cashback[index];
    const oldStatus = item.status;

    item.status = 'approved';
    item.amount = Number(amount);

    if (oldStatus !== 'approved') {
      finance.totalCashbackPaid = Number((finance.totalCashbackPaid + item.amount).toFixed(2));
    }

    await db.saveCollection('cashback');
    await db.saveCollection('finance');

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/cashback/:id/reject
router.put('/:id/reject', async (req, res) => {
  try {
    const { id } = req.params;
    const cashback = await db.getCollection('cashback');
    const finance = await db.getCollection('finance');
    const index = cashback.findIndex(c => c.id === id);

    if (index === -1) {
      return res.status(404).json({ error: 'Cashback record not found' });
    }

    const item = cashback[index];
    const oldStatus = item.status;
    item.status = 'rejected';

    if (oldStatus === 'approved') {
      finance.totalCashbackPaid = Number(Math.max(0, finance.totalCashbackPaid - item.amount).toFixed(2));
    }

    await db.saveCollection('cashback');
    await db.saveCollection('finance');

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
