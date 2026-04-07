import { adminDotnetApiClient } from '../../../integrations/dotnet-api/adminDotnetApiClient';
import type { ChatMessageDto } from '../../../integrations/realtime/chatHubTypes';
import { chatMessagesPageSchema } from './chatSchemas';

export const CHAT_MESSAGES_PAGE_SIZE = 50;

export interface ChatMessagesPageResult {
  items: ChatMessageDto[];
  page: number;
  pageSize: number;
  totalCount: number;
}

/**
 * Uma página de histórico da sala (texto já no idioma do membro, conforme API).
 */
export async function fetchChatMessagesPage(
  roomId: string,
  page: number,
  pageSize: number = CHAT_MESSAGES_PAGE_SIZE
): Promise<ChatMessagesPageResult> {
  const qs = new URLSearchParams({
    page: String(page),
    pageSize: String(pageSize),
  });
  const path = `/api/chat/rooms/${encodeURIComponent(roomId)}/messages?${qs.toString()}`;
  const raw = await adminDotnetApiClient.requestJson(path, { method: 'GET' }, chatMessagesPageSchema);
  return {
    items: raw.items as ChatMessageDto[],
    page: raw.page,
    pageSize: raw.pageSize,
    totalCount: raw.totalCount,
  };
}
