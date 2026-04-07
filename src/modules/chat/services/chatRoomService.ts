import { z } from 'zod';
import { adminDotnetApiClient } from '../../../integrations/dotnet-api/adminDotnetApiClient';
import type { ChatRoomDto } from '../types/chatTypes';
import { chatRoomResponseSchema } from './chatSchemas';

const listaSalasSchema = z.array(chatRoomResponseSchema);

export async function fetchChatRooms(): Promise<ChatRoomDto[]> {
  const list = await adminDotnetApiClient.requestJson(
    '/api/chat/rooms',
    { method: 'GET' },
    listaSalasSchema
  );
  return list.map(
    (r): ChatRoomDto => ({
      id: r.id,
      name: r.name,
      description: r.description ?? null,
      status: r.status,
      memberCount: r.memberCount,
      myRole: r.myRole,
      myLanguagePref: r.myLanguagePref,
      lastMessageAt: r.lastMessageAt ?? null,
    })
  );
}
