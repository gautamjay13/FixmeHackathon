const { z } = require('zod');

const registerSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Invalid email address'),
    // Accept phone numbers with optional country code (+91 etc), spaces/dashes, min 10 digits
    phone: z.string().regex(/^[+]?[\d\s\-]{10,15}$/, 'Phone must be 10-15 digits (e.g. 9876543210 or +91 9876543210)'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    role: z.string().optional()
  }).passthrough()
}).passthrough();

const loginSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(1, 'Password is required')
  }).passthrough() // allow extra fields like role sent from frontend
}).passthrough();

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
