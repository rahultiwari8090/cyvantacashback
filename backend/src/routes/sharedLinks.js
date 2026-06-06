import express from 'express';
import db from '../config/db.js';

const router = express.Router();

// GET /api/shared-links
router.get('/', async (req, res) => {
  try {
    const links = await db.getCollection('sharedLinks');
    res.json(links);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/shared-links/user/:userId
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const links = await db.getCollection('sharedLinks');
    const userLinks = links.filter(l => l.userId === userId);
    res.json(userLinks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/shared-links
router.post('/', async (req, res) => {
  try {
    const linkData = req.body;
    const links = await db.getCollection('sharedLinks');
    const id = 'sl' + Date.now();

    const newLink = {
      id,
      userId: linkData.userId,
      userName: linkData.userName,
      productName: linkData.productName,
      store: linkData.store,
      productUrl: linkData.productUrl,
      shortUrl: `https://cyvanta.cashback/share/${id}`,
      clicksCount: 0,
      conversionsCount: 0,
      totalEarnings: 0.00,
      userSharePercent: linkData.userSharePercent !== undefined ? Number(linkData.userSharePercent) : 100,
      buyerSharePercent: linkData.buyerSharePercent !== undefined ? Number(linkData.buyerSharePercent) : 0,
      status: 'active',
      date: new Date().toISOString().split('T')[0]
    };

    links.unshift(newLink);
    await db.saveCollection('sharedLinks');

    res.status(201).json(newLink);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/shared-links/:id
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const links = await db.getCollection('sharedLinks');
    const filtered = links.filter(l => l.id !== id);

    if (links.length === filtered.length) {
      return res.status(404).json({ error: 'Shared link not found' });
    }

    links.length = 0;
    links.push(...filtered);
    await db.saveCollection('sharedLinks');

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/shared-links/:id/click
router.post('/:id/click', async (req, res) => {
  try {
    const { id } = req.params;
    const links = await db.getCollection('sharedLinks');
    const users = await db.getCollection('users');
    const settings = await db.getCollection('settings');
    const commissions = await db.getCollection('sharedCommissions');

    const linkIndex = links.findIndex(l => l.id === id);
    if (linkIndex === -1) {
      return res.status(404).json({ error: 'Shared link not found' });
    }

    const link = links[linkIndex];
    link.clicksCount += 1;

    // Simulate 30% conversion rate on click
    if (Math.random() < 0.3) {
      const u = users.find(usr => usr.id === link.userId || usr.name === link.userName);
      const rate = u && u.sharedCommissionRate ? Number(u.sharedCommissionRate) : Number(settings.sharedCommissionPercent);
      const purchaseVal = Math.round(15 + Math.random() * 200);
      const totalComm = parseFloat(((purchaseVal * rate) / 100).toFixed(2));
      
      const userPct = link.userSharePercent !== undefined ? Number(link.userSharePercent) : 100;
      const buyerPct = link.buyerSharePercent !== undefined ? Number(link.buyerSharePercent) : 0;
      
      const userComm = parseFloat(((totalComm * userPct) / 100).toFixed(2));
      const buyerComm = parseFloat(((totalComm * buyerPct) / 100).toFixed(2));
      
      const commissionId = 'sc' + Date.now();
      const newComm = {
        id: commissionId,
        userId: link.userId,
        userName: link.userName,
        linkId: link.id,
        productName: link.productName,
        store: link.store,
        purchaseAmount: purchaseVal,
        commissionRate: rate,
        commissionAmount: totalComm,
        userSharePercent: userPct,
        buyerSharePercent: buyerPct,
        userCommissionAmount: userComm,
        buyerCommissionAmount: buyerComm,
        status: 'pending',
        date: new Date().toISOString().split('T')[0]
      };
      
      commissions.unshift(newComm);
      link.conversionsCount += 1;

      // Add only user's share to user's pending wallet
      if (u) {
        if (!u.wallet) {
          u.wallet = { confirmed: 0.00, pending: 0.00, referral: 0.00 };
        }
        u.wallet.pending = Number((u.wallet.pending + userComm).toFixed(2));
      }

      await db.saveCollection('sharedCommissions');
      await db.saveCollection('users');
    }

    await db.saveCollection('sharedLinks');
    res.json(link);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
