const { z } = require('zod');

const createReviewSchema = z.object({
  body: z.object({
    bookingId: z.string(), // Mongo ID
    rating: z.number().min(1).max(5),
    comment: z.string().max(1000).optional(),
    tags: z.array(z.string()).optional()
  })
});

const replyReviewSchema = z.object({
  body: z.object({
    reply: z.string().min(1, 'Reply cannot be empty')
  })
});

module.exports = {
  createReviewSchema,
  replyReviewSchema
};
