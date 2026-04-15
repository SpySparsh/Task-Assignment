const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../utils/prisma');
const { sendSuccess, sendError } = require('../utils/response');
const { registerSchema, loginSchema } = require('../validators/auth.validator');
const redis = require('../utils/redis');

const register = async (req, res) => {
  try {
    const validatedData = registerSchema.parse(req.body);

    const userExists = await prisma.user.findUnique({
      where: { email: validatedData.email }
    });

    if (userExists) {
      return sendError(res, 400, 'User already exists');
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(validatedData.password, salt);

    const user = await prisma.user.create({
      data: {
        name: validatedData.name,
        email: validatedData.email,
        password: hashedPassword,
      }
    });

    // Invalidate users cache for admin
    try {
      await redis.del('admin:users');
    } catch (err) {
      console.error('Redis error on register:', err);
    }

    return sendSuccess(res, 201, 'User registered successfully', {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    });

  } catch (error) {
    if (error.name === 'ZodError') {
      return sendError(res, 400, 'Validation Error', error.errors);
    }
    console.error(error);
    return sendError(res, 500, 'Server Error');
  }
};

const login = async (req, res) => {
  try {
    const validatedData = loginSchema.parse(req.body);

    const user = await prisma.user.findUnique({
      where: { email: validatedData.email }
    });

    if (!user) {
      return sendError(res, 401, 'Invalid credentials');
    }

    const isMatch = await bcrypt.compare(validatedData.password, user.password);

    if (!isMatch) {
      return sendError(res, 401, 'Invalid credentials');
    }

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    return sendSuccess(res, 200, 'Login successful', {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });

  } catch (error) {
    if (error.name === 'ZodError') {
      return sendError(res, 400, 'Validation Error', error.errors);
    }
    console.error(error);
    return sendError(res, 500, 'Server Error');
  }
};

const getMe = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true
      }
    });

    return sendSuccess(res, 200, 'User profile fetched', user);
  } catch (error) {
    console.error(error);
    return sendError(res, 500, 'Server Error');
  }
};

module.exports = {
  register,
  login,
  getMe
};
