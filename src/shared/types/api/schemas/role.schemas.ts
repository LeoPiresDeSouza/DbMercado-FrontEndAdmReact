import { z } from 'zod';

export const roleDtoSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  normalizedName: z.string().optional(),
  description: z.string().optional(),
});

export type RoleDto = z.infer<typeof roleDtoSchema>;
