import express from 'express';
import db from '../config/db.js';

const router = express.Router();

// GET /api/tracking
router.get('/', async (req, res) => {
  try {
    const tracking = await db.getCollection('tracking');
    res.json(tracking);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/tracking
router.post('/', async (req, res) => {
  try {
    const trackedOrder = req.body;
    const tracking = await db.getCollection('tracking');
    const cashback = await db.getCollection('cashback');

    const trackId = 'TRK' + Math.floor(10000000 + Math.random() * 90000000);
    const cashbackId = 'cb' + Date.now();

    const newTrack = {
      ...trackedOrder,
      id: trackId,
      cashbackId: cashbackId
    };

    const newCashback = {
      id: cashbackId,
      userName: trackedOrder.userName,
      productName: trackedOrder.productName,
      amount: Number(trackedOrder.cashbackAmount),
      status: 'pending',
      date: trackedOrder.orderDate
    };

    tracking.unshift(newTrack);
    cashback.unshift(newCashback);

    await db.saveCollection('tracking');
    await db.saveCollection('cashback');

    res.status(201).json(newTrack);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/tracking/:id/status
router.put('/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, ...datesUpdate } = req.body;

    const tracking = await db.getCollection('tracking');
    const cashback = await db.getCollection('cashback');
    const finance = await db.getCollection('finance');

    const orderIndex = tracking.findIndex(o => o.id === id);
    if (orderIndex === -1) {
      return res.status(404).json({ error: 'Order tracking not found' });
    }

    const order = tracking[orderIndex];
    order.status = status;
    Object.assign(order, datesUpdate);

    // Sync with cashback status
    const cashbackIndex = cashback.findIndex(c => c.id === order.cashbackId);
    if (cashbackIndex !== -1) {
      const cashbackItem = cashback[cashbackIndex];
      const oldStatus = cashbackItem.status;

      if (status === 'completed' && oldStatus !== 'approved') {
        cashbackItem.status = 'approved';
        finance.totalCashbackPaid = Number((finance.totalCashbackPaid + cashbackItem.amount).toFixed(2));
      } else if (status === 'returned' && oldStatus !== 'rejected') {
        cashbackItem.status = 'rejected';
        if (oldStatus === 'approved') {
          finance.totalCashbackPaid = Number(Math.max(0, finance.totalCashbackPaid - cashbackItem.amount).toFixed(2));
        }
      }
    }

    await db.saveCollection('tracking');
    await db.saveCollection('cashback');
    await db.saveCollection('finance');

    res.json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
