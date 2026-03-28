/**
 * Infraestrutura realtime administrativa (SignalR + JWT + métricas).
 * Backend: hub sugerido `/hubs/admin` com métodos opcionais `SubscribeToChannel`, `SetTenantContext`
 * e eventos `PedidoCancelado`, `PagamentoDevolvido`, `EstoqueBloqueado`, `NovoTicket`.
 */
export { AdminRealtimeProvider } from './AdminRealtimeProvider';
export { createAdminSignalRConnection } from './createAdminSignalRConnection';
export {
  getAdminSignalRHubUrl,
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
