import { z } from 'zod';

export const createCommentSchema = z.object({
  post: z.string().min(1),
  content: z.string().min(1).max(1000),
  parentComment: z.string().min(1).nullable().optional(),
});

export const updateCommentSchema = z.object({
  content: z.string().min(1).max(1000),
});
