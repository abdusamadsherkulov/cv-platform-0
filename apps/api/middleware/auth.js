import jwt from 'jsonwebtoken';
import { prisma } from '../prisma.js';

const userCache = new Map(); // userId -> { user, at }
const USER_TTL = 30 * 1000;

async function getUser(id) {
  const hit = userCache.get(id);
  if (hit && Date.now() - hit.at < USER_TTL) return hit.user;
  const user = await prisma.user.findUnique({ where: { id } });
  if (user) userCache.set(id, { user, at: Date.now() });
  return user;
}

export async function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await getUser(decoded.userId);
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