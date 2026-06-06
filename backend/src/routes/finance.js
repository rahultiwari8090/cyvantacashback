import express from 'express';
import db from '../config/db.js';

const router = express.Router();

// GET /api/finance
router.get('/', async (req, res) => {
  try {
    const finance = await db.getCollection('finance');
    res.json(finance);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
