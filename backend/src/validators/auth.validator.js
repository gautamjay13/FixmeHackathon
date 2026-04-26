const { z } = require('zod');

const registerSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Invalid email address'),
    phone: z.string().min(10, 'Invalid phone number format'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    role: z.string().optional()
  })
});

const loginSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(1, 'Password is required')
  })
});

const forgotPasswordSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address')
  })
});

const resetPasswordSchema = z.object({
  body: z.object({
    resetToken: z.string(),
    newPassword: z.string().min(6, 'Password must be at least 6 characters')
  })
});

module.exports = {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema
};
