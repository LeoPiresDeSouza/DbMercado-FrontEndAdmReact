/**
 * Payloads do hub de chat (JSON camelCase, GUIDs como string), alinhados ao backend.
 */

export type ChatMessageTranslationStatus = 'pending' | 'done' | 'failed';

export interface ChatMessageDto {
  messageId: string;
  roomId: string;
  senderId: string;
  senderName: string;
  content: string;
  isTranslated: boolean;
  /** Estado no servidor (`JsonStringEnumConverter` camelCase no hub). */
  translationStatus: ChatMessageTranslationStatus;
  sourceLang: string;
  /** ISO-8601 (UTC) */
  sentAt: string;
}

export function parseChatMessageTranslationStatus(
  raw: unknown
): ChatMessageTranslationStatus {
  if (raw === 'pending' || raw === 0) {
    return 'pending';
  }
  if (raw === 'done' || raw === 1) {
    return 'done';
  }
  if (raw === 'failed' || raw === 2) {
    return 'failed';
  }
  return 'pending';
}

/** Payload bruto do hub (campo `translationStatus` opcional ou enum numérico). */
export type ChatMessageDtoWire = Omit<ChatMessageDto, 'translationStatus'> & {
  translationStatus?: unknown;
};

/** Normaliza payload bruto do SignalR (enum numérico legado ou campo ausente). */
export function normalizeIncomingChatMessage(raw: ChatMessageDtoWire): ChatMessageDto {
  return {
    ...raw,
    translationStatus: parseChatMessageTranslationStatus(raw.translationStatus),
  };
}

export interface SendChatMessageDto {
  roomId: string;
  content: string;
  sourceLang: string;
}

export interface ChatHubCallbacks {
  onReceiveMessage?: (message: ChatMessageDto) => void;
  onReceiveTranslation?: (
    messageId: string,
    translatedText: string,
    targetLang: string
  ) => void;
  onTranslationFailed?: (messageId: string) => void;
  onUserTyping?: (
    roomId: string,
    userId: string,
    isTyping: boolean
  ) => void;
  onMessageRead?: (messageId: string, userId: string) => void;
  onUserInvited?: (invite: ChatInviteDto) => void;
}

/** Payload de `UserInvited` no hub (JSON camelCase). */
export interface ChatInviteDto {
  id: string;
  roomId: string;
  roomName: string;
  invitedByName: string;
  /** ISO-8601 (UTC) */
  expiresAt: string;
}
