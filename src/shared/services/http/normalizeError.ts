import { z } from 'zod';
import type { HttpBackendId } from './types';

export const normalizedErrorBodySchema = z.object({
  message: z.string().optional(),
  title: z.string().optional(),
  detail: z.string().optional(),
  errors: z.record(z.string(), z.union([z.array(z.string()), z.string()])).optional(),
});

export type NormalizedErrorBody = z.infer<typeof normalizedErrorBodySchema>;

export class NormalizedHttpError extends Error {
  readonly status: number;
  readonly backendId: HttpBackendId;
  readonly correlationId: string;
  readonly details: unknown;
  /** true quando a mensagem veio só de status/texto HTTP (sem corpo JSON útil). */
  readonly usedHttpFallback: boolean;

  constructor(params: {
    message: string;
    status: number;
    backendId: HttpBackendId;
    correlationId: string;
    details?: unknown;
    usedHttpFallback: boolean;
  }) {
    super(params.message);
    this.name = 'NormalizedHttpError';
    this.status = params.status;
    this.backendId = params.backendId;
    this.correlationId = params.correlationId;
    this.details = params.details ?? null;
    this.usedHttpFallback = params.usedHttpFallback;
  }
}

function flattenAspNetErrors(errors: Record<string, string[] | string> | undefined): string | undefined {
  if (!errors) {
    return undefined;
  }
  const parts: string[] = [];
  Object.entries(errors).forEach(([key, val]) => {
    if (Array.isArray(val)) {
      val.forEach((m) => parts.push(`${key}: ${m}`));
    } else {
      parts.push(`${key}: ${val}`);
    }
  });
  return parts.length > 0 ? parts.join('; ') : undefined;
}

export function buildErrorMessageFromBody(body: unknown): string | undefined {
  const parsed = normalizedErrorBodySchema.safeParse(body);
  if (!parsed.success) {
    return undefined;
  }
  const d = parsed.data;
  const fromErrors = flattenAspNetErrors(d.errors);
  return (
    d.message ??
    d.detail ??
    d.title ??
    fromErrors ??
    undefined
  );
}

export function normalizeHttpError(
  response: Response,
  backendId: HttpBackendId,
  correlationId: string,
  body: unknown
): NormalizedHttpError {
  const fromJson = buildErrorMessageFromBody(body);
  const usedHttpFallback = fromJson === undefined;
  const message = fromJson ?? (response.statusText || `HTTP ${response.status}`);
  return new NormalizedHttpError({
    message,
    status: response.status,
    backendId,
    correlationId,
    details: body,
    usedHttpFallback,
  });
}

export function isNormalizedHttpError(e: unknown): e is NormalizedHttpError {
  return e instanceof NormalizedHttpError;
}
