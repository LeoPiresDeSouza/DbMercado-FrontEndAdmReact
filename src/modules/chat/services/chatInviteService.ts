import { z } from 'zod';
import type { ChatInviteDto } from '../../../integrations/realtime/chatHubTypes';
import { adminDotnetApiClient } from '../../../integrations/dotnet-api/adminDotnetApiClient';
import type { ChatRoomDto } from '../types/chatTypes';
import { chatInvitesPendingListSchema, chatRoomResponseSchema } from './chatSchemas';

const declineBodySchema = z.object({}).passthrough();

export async function fetchConvitesPendentes(): Promise<ChatInviteDto[]> {
  return adminDotnetApiClient.requestJson(
    '/api/chat/invites/pending',
    { method: 'GET' },
    chatInvitesPendingListSchema
  );
}

export async function aceitarConvite(inviteId: string): Promise<ChatRoomDto> {
  const raw = await adminDotnetApiClient.requestJson(
    `/api/chat/invites/${inviteId}/accept`,
    { method: 'POST' },
    chatRoomResponseSchema
  );
  return mapRoom(raw);
}

export async function recusarConvite(inviteId: string): Promise<void> {
  await adminDotnetApiClient.requestJson(
    `/api/chat/invites/${inviteId}/decline`,
    { method: 'POST' },
    declineBodySchema
  );
}

function mapRoom(r: z.infer<typeof chatRoomResponseSchema>): ChatRoomDto {
  return {
    id: r.id,
    name: r.name,
    description: r.description ?? null,
    status: r.status,
    memberCount: r.memberCount,
    myRole: r.myRole,
    myLanguagePref: r.myLanguagePref,
    lastMessageAt: r.lastMessageAt ?? null,
  };
}
