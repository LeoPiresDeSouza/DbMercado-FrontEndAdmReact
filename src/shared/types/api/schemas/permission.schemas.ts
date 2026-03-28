import { z } from 'zod';

export const permissionDtoSchema = z.object({
  id: z.string().min(1),
  claimType: z.string().min(1),
  claimValue: z.string().min(1),
  moduleKey: z.string().optional(),
  featureKey: z.string().optional(),
});

export type PermissionDto = z.infer<typeof permissionDtoSchema>;
