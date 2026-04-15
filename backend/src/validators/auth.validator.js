const { z } = require('zod');

const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").trim(),
  email: z.string().email("Invalid email format").trim(),
  password: z.string().min(8, "Password must be at least 8 characters").trim()
});

const loginSchema = z.object({
  email: z.string().email("Invalid email format").trim(),
  password: z.string().min(1, "Password is required").trim()
});

module.exports = {
  registerSchema,
  loginSchema
};
