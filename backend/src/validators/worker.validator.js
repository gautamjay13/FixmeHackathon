const { z } = require('zod');

const registerWorkerSchema = z.object({
  body: z.object({
    skills: z.array(z.enum(['plumber', 'electrician', 'carpenter', 'painter', 'cleaner', 'ac_repair', 'appliance_repair', 'pest_control'])).min(1, 'At least one skill is required'),
    experience: z.number().min(0).max(50),
    bio: z.string().max(500).optional(),
    pricing: z.array(z.object({
      serviceType: z.string(),
      visitCharge: z.number(),
      perHourRate: z.number()
    })).min(1, 'Pricing is required'),
    serviceRadius: z.number().positive().optional()
  })
});

const updateProfileSchema = z.object({
  body: z.object({
    skills: z.array(z.string()).optional(),
    bio: z.string().max(500).optional(),
    pricing: z.array(z.object({
      serviceType: z.string(),
      visitCharge: z.number(),
      perHourRate: z.number()
    })).optional(),
    experience: z.number().min(0).max(50).optional(),
    serviceRadius: z.number().positive().optional()
  })
});

const locationSchema = z.object({
  body: z.object({
    lat: z.number(),
    lng: z.number()
  })
});

module.exports = {
  registerWorkerSchema,
  updateProfileSchema,
  locationSchema
};
