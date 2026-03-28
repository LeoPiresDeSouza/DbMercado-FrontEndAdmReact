import type { HubConnection } from '@microsoft/signalr';
import { useNotificationCenterStore } from '../../shared/stores/notificationCenterStore';
import { adminRealtimeMetrics } from './realtimeMetrics';
import {
  pickMeta,
  toastFromEstoqueBloqueado,
  toastFromNovoTicket,
  toastFromPagamentoDevolvido,
  toastFromPedidoCancelado,
} from './mapEventToNotification';
import type { AdminRealtimeChannel } from './types';

function channelFromPayload(payload: unknown): AdminRealtimeChannel | 'unknown' {
  if (typeof payload === 'object' && payload !== null && 'canal' in payload) {
    const c = (payload as { canal?: string }).canal;
    if (c === 'auditoria' || c === 'pedidos' || c === 'estoque' || c === 'suporte') {
      return c;
    }
  }
  return 'unknown';
}

/**
 * Registra listeners dos eventos administrativos e encaminha para toasts + métricas.
 */
export function registerAdminHubHandlers(connection: HubConnection): void {
  const add = useNotificationCenterStore.getState().add;

  connection.on('PedidoCancelado', (payload: unknown) => {
    const ch = channelFromPayload(payload);
    adminRealtimeMetrics.recordInboundMessage(ch, 'PedidoCancelado', pickMeta(payload));
    const t = toastFromPedidoCancelado(payload);
    add({ title: t.title, body: t.body, severity: t.severity });
  });

  connection.on('PagamentoDevolvido', (payload: unknown) => {
    const ch = channelFromPayload(payload);
    adminRealtimeMetrics.recordInboundMessage(ch, 'PagamentoDevolvido', pickMeta(payload));
    const t = toastFromPagamentoDevolvido(payload);
    add({ title: t.title, body: t.body, severity: t.severity });
  });

  connection.on('EstoqueBloqueado', (payload: unknown) => {
    const ch = channelFromPayload(payload);
    adminRealtimeMetrics.recordInboundMessage(ch, 'EstoqueBloqueado', pickMeta(payload));
    const t = toastFromEstoqueBloqueado(payload);
    add({ title: t.title, body: t.body, severity: t.severity });
  });

  connection.on('NovoTicket', (payload: unknown) => {
    const ch = channelFromPayload(payload);
    adminRealtimeMetrics.recordInboundMessage(ch, 'NovoTicket', pickMeta(payload));
    const t = toastFromNovoTicket(payload);
    add({ title: t.title, body: t.body, severity: t.severity });
  });
}

export function unregisterAdminHubHandlers(connection: HubConnection): void {
  connection.off('PedidoCancelado');
  connection.off('PagamentoDevolvido');
  connection.off('EstoqueBloqueado');
  connection.off('NovoTicket');
}
