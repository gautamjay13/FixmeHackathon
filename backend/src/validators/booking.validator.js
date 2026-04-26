const { z } = require('zod');

const createBookingSchema = z.object({
  body: z.object({
    serviceType: z.enum(['plumber', 'electrician', 'carpenter', 'painter', 'cleaner', 'ac_repair', 'appliance_repair', 'pest_control']),
    problemTitle: z.string().min(5, 'Title must be at least 5 characters'),
    problemDescription: z.string().min(10, 'Description must be at least 10 characters'),
    address: z.object({
      fullAddress: z.string(),
      street: z.string().optional(),
      city: z.string(),
      pincode: z.string()
    }),
    coordinates: z.object({
      lat: z.number(),
      lng: z.number()
    }),
    scheduledAt: z.string().datetime().optional(), // ISO string
    workerId: z.string().optional(), // Mongo ID string
    isEmergency: z.boolean().optional()
  })
});

const updateStatusSchema = z.object({
  body: z.object({
    status: z.enum(['accepted', 'workerAssigned', 'inProgress', 'completed', 'cancelled', 'disputed']),
    note: z.string().optional()
  })
});

const completeBookingSchema = z.object({
  body: z.object({
    finalCost: z.number().positive('Final cost must be positive'),
    workDescription: z.string().optional()
  })
});

module.exports = {
  createBookingSchema,
  updateStatusSchema,
  completeBookingSchema
};
