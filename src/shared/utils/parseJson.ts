import { type ZodType, z } from 'zod';
import { INVALID_API_RESPONSE_CODE } from '../constants/errorCodes';

export function parseJsonWithSchema<T extends ZodType>(
  schema: T,
  data: unknown
): z.infer<T> {
  const result = schema.safeParse(data);
  if (!result.success) {
    const detail = result.error.issues.map((i) => i.message).join('; ');
    throw new Error(detail || INVALID_API_RESPONSE_CODE);
  }
  return result.data;
}
