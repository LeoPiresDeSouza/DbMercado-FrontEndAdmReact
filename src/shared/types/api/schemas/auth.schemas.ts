import { z } from 'zod';

/** Corpo enviado para POST /api/Auth/login */
export const loginRequestSchema = z.object({
  email: z.string().min(1),
  password: z.string().min(1),
});

export type LoginRequestDto = z.infer<typeof loginRequestSchema>;

/**
 * Resposta de autenticação (alinhada a LoginResponse da API .NET).
 * JSON em camelCase: token, expiration, refreshToken, refreshTokenExpiration.
 */
export const authTokenDtoSchema = z.object({
  token: z.string().min(1),
  expiration: z.string().min(1),
  refreshToken: z.string().min(1),
  refreshTokenExpiration: z.string().min(1),
});

export type AuthTokenDto = z.infer<typeof authTokenDtoSchema>;

/** Body POST /api/Auth/refresh (camelCase). */
export const refreshTokenRequestSchema = z.object({
  refreshToken: z.string().min(1),
});

export type RefreshTokenRequestDto = z.infer<typeof refreshTokenRequestSchema>;

export const apiErrorBodySchema = z.object({
  message: z.string().optional(),
});

export type ApiErrorBody = z.infer<typeof apiErrorBodySchema>;
