const { z } = require('zod');

const createTaskSchema = z.object({
  title: z.string().min(1, "Title is required").trim(),
  description: z.string().trim().optional().nullable(),
  status: z.enum(['PENDING', 'IN_PROGRESS', 'DONE']).optional().default('PENDING'),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH']).optional().default('MEDIUM'),
  dueDate: z.string().datetime({ message: "Invalid ISO 8601 date" }).optional().nullable()
});

const updateTaskSchema = z.object({
  title: z.string().min(1, "Title is required").trim().optional(),
  description: z.string().trim().optional().nullable(),
  status: z.enum(['PENDING', 'IN_PROGRESS', 'DONE']).optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH']).optional(),
  dueDate: z.string().datetime({ message: "Invalid ISO 8601 date" }).optional().nullable()
});

module.exports = {
  createTaskSchema,
  updateTaskSchema
};
