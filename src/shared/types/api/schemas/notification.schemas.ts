import { z } from 'zod';

export const notificationSeveritySchema = z.enum(['info', 'success', 'warning', 'error']);

export const notificationDtoSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  body: z.string().optional(),
  severity: notificationSeveritySchema.optional(),
  readAtUtc: z.string().nullable().optional(),
  createdAtUtc: z.string().optional(),
});

export type NotificationDto = z.infer<typeof notificationDtoSchema>;
export type NotificationSeverity = z.infer<typeof notificationSeveritySchema>;
