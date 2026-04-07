import { z } from 'zod';
import { parseChatMessageTranslationStatus } from '../../../integrations/realtime/chatHubTypes';

/** Resposta de sala (`RoomResponse` da API, camelCase). */
export const chatRoomResponseSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  description: z.string().nullable().optional(),
  status: z.string(),
  memberCount: z.number(),
  myRole: z.string(),
  myLanguagePref: z.string(),
  lastMessageAt: z.string().nullable().optional(),
});

/** Item de mensagem (`MessageDto` da API REST / hub, camelCase). */
export const chatMessageDtoSchema = z.object({
  messageId: z.string().uuid(),
  roomId: z.string().uuid(),
  senderId: z.string(),
  senderName: z.string(),
  content: z.string(),
  isTranslated: z.boolean(),
  translationStatus: z.preprocess(
    (v) => parseChatMessageTranslationStatus(v),
    z.enum(['pending', 'done', 'failed'])
  ),
  sourceLang: z.string(),
  sentAt: z.string(),
});

/** Página de mensagens (`ChatMessagesPageResponse`). */
export const chatMessagesPageSchema = z.object({
  items: z.array(chatMessageDtoSchema),
  page: z.number(),
  pageSize: z.number(),
  totalCount: z.number(),
});

/** Convite (`InviteResponse` / evento `UserInvited`, camelCase). */
export const chatInviteResponseSchema = z.object({
  id: z.string().uuid(),
  roomId: z.string().uuid(),
  roomName: z.string(),
  invitedByName: z.string(),
  expiresAt: z.string(),
});

export const chatInvitesPendingListSchema = z.array(chatInviteResponseSchema);
