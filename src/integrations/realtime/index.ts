/**
 * Infraestrutura realtime (SignalR + JWT + métricas onde aplicável).
 * Admin: hub sugerido `/hubs/admin`. Chat multilíngue: `/hubs/chat` (JWT via query no WebSocket).
 */
export { AdminRealtimeProvider } from './AdminRealtimeProvider';
export { createAdminSignalRConnection } from './createAdminSignalRConnection';
export { createChatSignalRConnection } from './createChatSignalRConnection';
export {
  useChatHub,
  type UseChatHubOptions,
  type UseChatHubResult,
} from './useChatHub';
export type {
  ChatHubCallbacks,
  ChatInviteDto,
  ChatMessageDto,
  ChatMessageDtoWire,
  ChatMessageTranslationStatus,
  SendChatMessageDto,
} from './chatHubTypes';
export {
  normalizeIncomingChatMessage,
  parseChatMessageTranslationStatus,
} from './chatHubTypes';
export {
  getAdminSignalRHubUrl,
  getChatSignalRHubUrl,
  isAdminRealtimeEnabled,
} from './config';
export {
  adminRealtimeMetrics,
  getAdminRealtimeMetricsSnapshot,
  type RealtimeMetricsSnapshot,
} from './realtimeMetrics';
export { subscribeAdminRealtimeChannels } from './subscribeChannels';
export {
  ADMIN_REALTIME_CHANNELS,
  ADMIN_REALTIME_EVENTS,
  type AdminRealtimeChannel,
  type AdminRealtimeEventName,
  type AdminRealtimePayload,
  type EstoqueBloqueadoPayload,
  type NovoTicketPayload,
  type PagamentoDevolvidoPayload,
  type PedidoCanceladoPayload,
  type RealtimeEnvelopeMeta,
} from './types';
export { registerAdminHubHandlers, unregisterAdminHubHandlers } from './adminHubHandlers';
