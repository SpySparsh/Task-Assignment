const prisma = require('../utils/prisma');
const { sendSuccess, sendError } = require('../utils/response');
const { createTaskSchema, updateTaskSchema } = require('../validators/task.validator');
const redis = require('../utils/redis');

const invalidateTasksCache = async (userId) => {
  try {
    await redis.del(`tasks:user:${userId}`);
    await redis.del('tasks:admin:all');
  } catch (error) {
    console.error('Redis invalidation error:', error);
  }
};

const getTasks = async (req, res) => {
  try {
    const cacheKey = req.user.role === 'ADMIN' ? 'tasks:admin:all' : `tasks:user:${req.user.id}`;
    
    try {
      const cached = await redis.get(cacheKey);
      if (cached) {
        return sendSuccess(res, 200, 'Tasks fetched (cache)', JSON.parse(cached));
      }
    } catch (err) {
      console.error('Redis GET error:', err);
    }

    let tasks;
    if (req.user.role === 'ADMIN') {
      tasks = await prisma.task.findMany({
        include: { user: { select: { id: true, name: true, email: true } } },
        orderBy: { createdAt: 'desc' }
      });
    } else {
      tasks = await prisma.task.findMany({
        where: { userId: req.user.id },
        orderBy: { createdAt: 'desc' }
      });
    }

    try {
      await redis.setex(cacheKey, 60, JSON.stringify(tasks));
    } catch (err) {
      console.error('Redis SET error:', err);
    }

    return sendSuccess(res, 200, 'Tasks fetched', tasks);
  } catch (error) {
    console.error(error);
    return sendError(res, 500, 'Server Error');
  }
};

const getTask = async (req, res) => {
  try {
    const taskId = req.params.id;
    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: { user: { select: { id: true, name: true, email: true } } }
    });

    if (!task) {
      return sendError(res, 404, 'Task not found');
    }

    if (task.userId !== req.user.id && req.user.role !== 'ADMIN') {
      return sendError(res, 403, 'Not authorized to access this task');
    }

    return sendSuccess(res, 200, 'Task fetched', task);
  } catch (error) {
    console.error(error);
    return sendError(res, 500, 'Server Error');
  }
};

const createTask = async (req, res) => {
  try {
    const validatedData = createTaskSchema.parse(req.body);

    const task = await prisma.task.create({
      data: {
        title: validatedData.title,
        description: validatedData.description,
        status: validatedData.status,
        priority: validatedData.priority,
        dueDate: validatedData.dueDate ? new Date(validatedData.dueDate) : null,
        userId: req.user.id
      }
    });

    await invalidateTasksCache(req.user.id);

    return sendSuccess(res, 201, 'Task created', task);
  } catch (error) {
    if (error.name === 'ZodError') {
      return sendError(res, 400, 'Validation Error', error.errors);
    }
    console.error(error);
    return sendError(res, 500, 'Server Error');
  }
};

const updateTask = async (req, res) => {
  try {
    const taskId = req.params.id;
    const validatedData = updateTaskSchema.parse(req.body);

    const task = await prisma.task.findUnique({ where: { id: taskId } });

    if (!task) {
      return sendError(res, 404, 'Task not found');
    }

    if (task.userId !== req.user.id && req.user.role !== 'ADMIN') {
      return sendError(res, 403, 'Not authorized to update this task');
    }

    const updatedTask = await prisma.task.update({
      where: { id: taskId },
      data: validatedData
    });

    await invalidateTasksCache(task.userId);

    return sendSuccess(res, 200, 'Task updated', updatedTask);
  } catch (error) {
    if (error.name === 'ZodError') {
      return sendError(res, 400, 'Validation Error', error.errors);
    }
    console.error(error);
    return sendError(res, 500, 'Server Error');
  }
};

const deleteTask = async (req, res) => {
  try {
    const taskId = req.params.id;
    
    const task = await prisma.task.findUnique({ where: { id: taskId } });

    if (!task) {
      return sendError(res, 404, 'Task not found');
    }

    if (task.userId !== req.user.id && req.user.role !== 'ADMIN') {
      return sendError(res, 403, 'Not authorized to delete this task');
    }

    await prisma.task.delete({ where: { id: taskId } });

    await invalidateTasksCache(task.userId);

    return sendSuccess(res, 200, 'Task deleted');
  } catch (error) {
    console.error(error);
    return sendError(res, 500, 'Server Error');
  }
};

module.exports = {
  getTasks,
  getTask,
  createTask,
  updateTask,
  deleteTask
};
