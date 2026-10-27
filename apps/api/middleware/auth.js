import jwt from 'jsonwebtoken';
import { PrismaClient } from '../generated/prisma/index.js';

const prisma = new PrismaClient();

export async function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await prisma.user.findUnique({ where: { id: decoded.userId } });
    if (!user) return res.status(401).json({ error: 'User no longer exists' });
    if (user.isBlocked) return res.status(403).json({ error: 'Your account has been blocked' });

    req.user = { userId: user.id, role: user.role }; // always fresh, not from the (possibly stale) token
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

export function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Not authorized for this action' });
    }
    next();
  };
}