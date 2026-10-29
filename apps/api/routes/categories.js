import express from 'express';
import { prisma } from '../db.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

router.get('/', requireAuth, async (req, res) => {
  const categories = await prisma.attributeCategory.findMany({
    orderBy: { name: 'asc' },
  });
  res.json(categories);
});

export default router;