import express from 'express';
import db from '../config/db.js';

const router = express.Router();

// GET /api/users
router.get('/', async (req, res) => {
  try {
    const users = await db.getCollection('users');
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/users/:id/status
router.put('/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ error: 'Status is required' });
    }

    const users = await db.getCollection('users');
    const userIndex = users.findIndex(u => u.id === id);

    if (userIndex === -1) {
      return res.status(404).json({ error: 'User not found' });
    }

    users[userIndex].status = status;
    await db.saveCollection('users');

    res.json(users[userIndex]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
