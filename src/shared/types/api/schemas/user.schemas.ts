import { z } from 'zod';

/** Contrato compartilhável (web + mobile) para usuário administrativo */
export const userDtoSchema = z.object({
  id: z.string().min(1),
  email: z.string().email().optional(),
  userName: z.string().min(1).optional(),
  displayName: z.string().optional(),
  isActive: z.boolean().optional(),
  createdAtUtc: z.string().optional(),
});

export type UserDto = z.infer<typeof userDtoSchema>;
