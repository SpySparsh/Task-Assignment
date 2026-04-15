const express = require('express');
const prisma = require('../utils/prisma');
const { protect } = require('../middleware/auth.middleware');
const { requireRole } = require('../middleware/role.middleware');
const { sendSuccess, sendError } = require('../utils/response');
const redis = require('../utils/redis');

const router = express.Router();

router.use(protect);
router.use(requireRole(['ADMIN']));

router.get('/users', async (req, res) => {
  try {
    const cacheKey = 'admin:users';
    
    try {
      const cached = await redis.get(cacheKey);
      if (cached) {
        return sendSuccess(res, 200, 'Users fetched (cache)', JSON.parse(cached));
      }
    } catch (err) {
      console.error('Redis GET error:', err);
    }

    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true
      },
      orderBy: { createdAt: 'desc' }
    });

    try {
      await redis.setex(cacheKey, 120, JSON.stringify(users));
    } catch (err) {
      console.error('Redis SET error:', err);
    }

    return sendSuccess(res, 200, 'Users fetched', users);
  } catch (error) {
    console.error(error);
    return sendError(res, 500, 'Server Error');
  }
});

module.exports = router;
