const jwt = require('jsonwebtoken');
const prisma = require('../utils/prisma');
const { sendError } = require('../utils/response');

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return sendError(res, 401, 'Not authorized, token missing');
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: { id: true, name: true, email: true, role: true }
    });

    if (!user) {
      return sendError(res, 401, 'Not authorized, user not found');
    }

    req.user = user;
    next();
  } catch (error) {
    console.error(error);
    return sendError(res, 401, 'Not authorized, token invalid');
  }
};

module.exports = { protect };
