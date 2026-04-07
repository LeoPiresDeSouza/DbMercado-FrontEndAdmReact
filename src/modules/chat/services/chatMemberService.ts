import { adminDotnetApiClient } from '../../../integrations/dotnet-api/adminDotnetApiClient';
import { generateCorrelationId } from '../../../shared/services/http/correlationId';
import { normalizeHttpError } from '../../../shared/services/http/normalizeError';
import { readResponseJsonUnknown } from '../../../shared/utils/readJson';

/** `PUT /api/chat/members/{roomId}/language` — 204 No Content. */
export async function putChatMemberLanguage(roomId: string, languagePref: string): Promise<void> {
  const correlationId = generateCorrelationId();
  const response = await adminDotnetApiClient.request(`/api/chat/members/${roomId}/language`, {
    method: 'PUT',
    body: JSON.stringify({ languagePref }),
    correlationId,
  });
  if (!response.ok) {
    const raw = await readResponseJsonUnknown(response);
    throw normalizeHttpError(response, 'dotnet', correlationId, raw);
  }
}
