import express from 'express';
import db from '../config/db.js';

const router = express.Router();

// GET /api/settings
router.get('/', async (req, res) => {
  try {
    const settings = await db.getCollection('settings');
    res.json(settings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/settings
router.put('/', async (req, res) => {
  try {
    const settings = await db.getCollection('settings');
    
    // Merge existing settings with requested updates
    Object.assign(settings, req.body);
    await db.saveCollection('settings');
    
    res.json(settings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
