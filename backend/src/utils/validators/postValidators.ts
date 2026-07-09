import { z } from 'zod';

export const createPostSchema = z.object({
  title: z.string().min(3).max(150),
  content: z.string().min(10),
  excerpt: z.string().max(300).optional(),
  coverImage: z.string().optional(),
  coverImagePublicId: z.string().optional(),
  tags: z.array(z.string().min(1).max(30)).max(10).optional(),
  category: z.string().min(1).max(40).optional(),
  status: z.enum(['draft', 'published']).optional(),
});

export const updatePostSchema = createPostSchema.partial();
