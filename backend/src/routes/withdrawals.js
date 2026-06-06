import express from 'express';
import db from '../config/db.js';

const router = express.Router();

// GET /api/withdrawals
router.get('/', async (req, res) => {
  try {
    const withdrawals = await db.getCollection('withdrawals');
    res.json(withdrawals);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/withdrawals
router.post('/', async (req, res) => {
  try {
    const withdrawalReq = req.body;
    if (!withdrawalReq.amount || !withdrawalReq.userName) {
      return res.status(400).json({ error: 'userName and amount are required' });
    }

    const withdrawals = await db.getCollection('withdrawals');
    const finance = await db.getCollection('finance');

    const newReq = {
      ...withdrawalReq,
      id: 'w' + Date.now(),
      status: 'pending',
      date: withdrawalReq.date || new Date().toISOString().split('T')[0]
    };

    withdrawals.unshift(newReq);
    finance.pendingWithdrawals = Number((finance.pendingWithdrawals + Number(withdrawalReq.amount)).toFixed(2));

    await db.saveCollection('withdrawals');
    await db.saveCollection('finance');

    res.status(201).json(newReq);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/withdrawals/:id/approve
router.put('/:id/approve', async (req, res) => {
  try {
    const { id } = req.params;
    const { amount } = req.body;

    if (amount === undefined) {
      return res.status(400).json({ error: 'Amount is required to approve withdrawal' });
    }

    const withdrawals = await db.getCollection('withdrawals');
    const finance = await db.getCollection('finance');

    const index = withdrawals.findIndex(w => w.id === id);
    if (index === -1) {
      return res.status(404).json({ error: 'Withdrawal request not found' });
    }

    const reqItem = withdrawals[index];
    const oldStatus = reqItem.status;
    const approveAmount = Number(amount);

    reqItem.status = 'approved';

    if (oldStatus === 'pending') {
      finance.totalWithdrawPaid = Number((finance.totalWithdrawPaid + approveAmount).toFixed(2));
      finance.pendingWithdrawals = Number(Math.max(0, finance.pendingWithdrawals - approveAmount).toFixed(2));
      
      finance.transactions.unshift({
        id: `tx-w-${id}`,
        desc: `Approved Withdrawal (UPI) - ${reqItem.userName}`,
        type: 'debit',
        amount: approveAmount,
        date: new Date().toISOString().split('T')[0]
      });
    }

    await db.saveCollection('withdrawals');
    await db.saveCollection('finance');

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/withdrawals/:id/reject
router.put('/:id/reject', async (req, res) => {
  try {
    const { id } = req.params;
    const { amount } = req.body;

    if (amount === undefined) {
      return res.status(400).json({ error: 'Amount is required to reject withdrawal' });
    }

    const withdrawals = await db.getCollection('withdrawals');
    const finance = await db.getCollection('finance');

    const index = withdrawals.findIndex(w => w.id === id);
    if (index === -1) {
      return res.status(404).json({ error: 'Withdrawal request not found' });
    }

    const reqItem = withdrawals[index];
    const oldStatus = reqItem.status;
    const rejectAmount = Number(amount);

    reqItem.status = 'rejected';

    if (oldStatus === 'pending') {
      finance.pendingWithdrawals = Number(Math.max(0, finance.pendingWithdrawals - rejectAmount).toFixed(2));
    }

    await db.saveCollection('withdrawals');
    await db.saveCollection('finance');

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
