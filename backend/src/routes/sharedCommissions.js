import express from 'express';
import db from '../config/db.js';

const router = express.Router();

// GET /api/shared-commissions
router.get('/', async (req, res) => {
  try {
    const commissions = await db.getCollection('sharedCommissions');
    res.json(commissions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/shared-commissions/user/:userId
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const commissions = await db.getCollection('sharedCommissions');
    const userComms = commissions.filter(c => c.userId === userId);
    res.json(userComms);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/shared-commissions
router.post('/', async (req, res) => {
  try {
    const commData = req.body;
    const commissions = await db.getCollection('sharedCommissions');
    const links = await db.getCollection('sharedLinks');
    const users = await db.getCollection('users');

    const userPct = commData.userSharePercent !== undefined ? Number(commData.userSharePercent) : 100;
    const buyerPct = commData.buyerSharePercent !== undefined ? Number(commData.buyerSharePercent) : 0;
    const commAmt = Number(commData.commissionAmount);
    
    const userComm = parseFloat(((commAmt * userPct) / 100).toFixed(2));
    const buyerComm = parseFloat(((commAmt * buyerPct) / 100).toFixed(2));

    const newComm = {
      ...commData,
      id: 'sc' + Date.now(),
      commissionAmount: commAmt,
      userSharePercent: userPct,
      buyerSharePercent: buyerPct,
      userCommissionAmount: userComm,
      buyerCommissionAmount: buyerComm,
      status: 'pending',
      date: commData.date || new Date().toISOString().split('T')[0]
    };

    commissions.unshift(newComm);

    // Update link conversion count
    const link = links.find(l => l.id === commData.linkId);
    if (link) {
      link.conversionsCount = (link.conversionsCount || 0) + 1;
    }

    // Add to user pending wallet
    const u = users.find(usr => usr.id === commData.userId || usr.name === commData.userName);
    if (u) {
      if (!u.wallet) {
        u.wallet = { confirmed: 0.00, pending: 0.00, referral: 0.00 };
      }
      u.wallet.pending = Number((u.wallet.pending + userComm).toFixed(2));
    }

    await db.saveCollection('sharedCommissions');
    await db.saveCollection('sharedLinks');
    await db.saveCollection('users');

    res.status(201).json(newComm);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/shared-commissions/:id/status
router.put('/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, amount } = req.body;

    if (!status || amount === undefined) {
      return res.status(400).json({ error: 'status and amount are required' });
    }

    const commissions = await db.getCollection('sharedCommissions');
    const users = await db.getCollection('users');
    const links = await db.getCollection('sharedLinks');
    const finance = await db.getCollection('finance');

    const index = commissions.findIndex(c => c.id === id);
    if (index === -1) {
      return res.status(404).json({ error: 'Shared commission record not found' });
    }

    const commission = commissions[index];
    const oldStatus = commission.status;
    const oldUserComm = Number(commission.userCommissionAmount);
    
    const finalAmount = Number(amount);
    const userPct = commission.userSharePercent !== undefined ? Number(commission.userSharePercent) : 100;
    const buyerPct = commission.buyerSharePercent !== undefined ? Number(commission.buyerSharePercent) : 0;
    
    const userComm = parseFloat(((finalAmount * userPct) / 100).toFixed(2));
    const buyerComm = parseFloat(((finalAmount * buyerPct) / 100).toFixed(2));

    // Update commission values
    commission.status = status;
    commission.commissionAmount = finalAmount;
    commission.userCommissionAmount = userComm;
    commission.buyerCommissionAmount = buyerComm;

    // Find user to adjust wallet
    const u = users.find(usr => usr.id === commission.userId || usr.name === commission.userName);
    if (u) {
      if (!u.wallet) {
        u.wallet = { confirmed: 0.00, pending: 0.00, referral: 0.00 };
      }

      if (status === 'approved') {
        if (oldStatus !== 'approved') {
          // Move user share to confirmed wallet
          u.wallet.confirmed = Number((u.wallet.confirmed + userComm).toFixed(2));
          if (oldStatus === 'pending') {
            u.wallet.pending = Number(Math.max(0, u.wallet.pending - oldUserComm).toFixed(2));
          }
        } else {
          // Already approved, adjust confirmed for difference
          const difference = userComm - oldUserComm;
          u.wallet.confirmed = Number((u.wallet.confirmed + difference).toFixed(2));
        }
      } else if (status === 'rejected') {
        if (oldStatus === 'pending') {
          u.wallet.pending = Number(Math.max(0, u.wallet.pending - oldUserComm).toFixed(2));
        } else if (oldStatus === 'approved') {
          // Was approved, need to deduct from confirmed
          u.wallet.confirmed = Number(Math.max(0, u.wallet.confirmed - oldUserComm).toFixed(2));
        }
      }
    }

    // Update link earnings
    const link = links.find(l => l.id === commission.linkId);
    if (link) {
      // Re-calculate link total earnings based on all approved commissions
      const approvedCommsForLink = commissions.filter(c => c.linkId === link.id && c.status === 'approved');
      link.totalEarnings = Number(approvedCommsForLink.reduce((sum, c) => sum + Number(c.userCommissionAmount), 0).toFixed(2));
    }

    // Update finance total cashback paid if approved
    if (status === 'approved' && oldStatus !== 'approved') {
      finance.totalCashbackPaid = Number((finance.totalCashbackPaid + finalAmount).toFixed(2));
    } else if (status !== 'approved' && oldStatus === 'approved') {
      finance.totalCashbackPaid = Number(Math.max(0, finance.totalCashbackPaid - finalAmount).toFixed(2));
    }

    await db.saveCollection('sharedCommissions');
    await db.saveCollection('users');
    await db.saveCollection('sharedLinks');
    await db.saveCollection('finance');

    res.json(commission);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
