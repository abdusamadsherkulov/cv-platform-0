import express from 'express';
import { prisma } from '../db.js';

const router = express.Router();

let cache = { data: null, at: 0 };
const TTL = 60 * 1000;
// public - no auth required, per spec (visible to non-logged-in users too)
router.get('/', async (req, res) => {
  if (cache.data && Date.now() - cache.at < TTL) return res.json(cache.data);
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

  const [
    latestPositions,
    totalPositions,
    totalCandidates,
    totalRecruiters,
    totalCVs,
    recentCVs,
    positionsWithCvCounts,
    allProjects,
  ] = await Promise.all([
    prisma.position.findMany({ orderBy: { updatedAt: 'desc' }, take: 5 }),
    prisma.position.count(),
    prisma.user.count({ where: { role: 'candidate' } }),
    prisma.user.count({ where: { role: 'recruiter' } }),
    prisma.cV.count(),
    prisma.cV.count({ where: { createdAt: { gte: oneDayAgo } } }),
    prisma.position.findMany({
      include: { _count: { select: { cvs: true } } },
      orderBy: { cvs: { _count: 'desc' } },
      take: 5,
    }),
    prisma.project.findMany({ select: { tags: true } }),
  ]);

  const tagCounts = {};
  for (const project of allProjects) {
    for (const tag of project.tags) {
      tagCounts[tag] = (tagCounts[tag] || 0) + 1;
    }
  }
  const tagCloud = Object.entries(tagCounts).map(([tag, count]) => ({ tag, count }));

  const payload = {
    latestPositions,
    stats: { totalPositions, totalCandidates, totalRecruiters, totalCVs, recentCVs },
    popularPositions: positionsWithCvCounts,
    tagCloud,
  };
  cache = { data: payload, at: Date.now() };
  res.json(payload);
});

export default router;