import express from 'express';
import { PrismaClient } from '../generated/prisma/index.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const prisma = new PrismaClient();
const router = express.Router();

// list all users - admin only
router.get('/', requireAuth, requireRole('admin'), async (req, res) => {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
  });
  res.json(users);
});

// change a user's role
router.put('/:id/role', requireAuth, requireRole('admin'), async (req, res) => {
  const { role } = req.body;
  const id = Number(req.params.id);

  const user = await prisma.user.update({
    where: { id },
    data: { role },
  });

  res.json(user);
});

// block / unblock a user
router.put('/:id/block', requireAuth, requireRole('admin'), async (req, res) => {
  const { isBlocked } = req.body;
  const id = Number(req.params.id);

  const user = await prisma.user.update({
    where: { id },
    data: { isBlocked },
  });

  res.json(user);
});

// delete a user
router.delete('/:id', requireAuth, requireRole('admin'), async (req, res) => {
  await prisma.user.delete({ where: { id: Number(req.params.id) } });
  res.status(204).send();
});

export default router;