import { z } from 'zod';

export const updateProfileSchema = z.object({
  name: z.string().min(2).max(80).optional(),
  bio: z.string().max(280).optional(),
  avatar: z.string().optional(),
  avatarPublicId: z.string().optional(),
  socialLinks: z
    .object({
      website: z.string().max(200).optional(),
      twitter: z.string().max(200).optional(),
      github: z.string().max(200).optional(),
      linkedin: z.string().max(200).optional(),
    })
    .partial()
    .optional(),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(8, 'New password must be at least 8 characters').max(72),
});
