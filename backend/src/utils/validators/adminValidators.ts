import { z } from 'zod';

export const updateUserRoleSchema = z.object({
  role: z.enum(['user', 'admin'], { message: 'Role must be either "user" or "admin".' }),
});
