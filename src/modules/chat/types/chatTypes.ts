/** Resposta de `GET /api/chat/rooms` (sala + papel/idioma do usuário atual). */
export interface ChatRoomDto {
  id: string;
  name: string;
  description: string | null;
  status: string;
  memberCount: number;
  myRole: string;
  myLanguagePref: string;
  /** ISO-8601 (UTC) da última mensagem ativa na sala, se houver. */
  lastMessageAt: string | null;
}
