/** Canais lógicos — alinhar com grupos / streams do hub .NET. */
export const ADMIN_REALTIME_CHANNELS = ['auditoria', 'pedidos', 'estoque', 'suporte'] as const;

export type AdminRealtimeChannel = (typeof ADMIN_REALTIME_CHANNELS)[number];

/** Nomes de eventos enviados pelo servidor (SendAsync / Clients.All...). */
export const ADMIN_REALTIME_EVENTS = [
  'PedidoCancelado',
  'PagamentoDevolvido',
  'EstoqueBloqueado',
  'NovoTicket',
] as const;

export type AdminRealtimeEventName = (typeof ADMIN_REALTIME_EVENTS)[number];

/** Metadados opcionais para métrica de latência (incluir no payload do servidor quando possível). */
export interface RealtimeEnvelopeMeta {
  /** Quando o servidor emitiu o evento (ISO 8601). */
  emittedAtUtc?: string;
  /** Eco opcional do timestamp do cliente na requisição que originou o evento. */
  clientSentAtUtc?: string;
  correlationId?: string;
}

export interface PedidoCanceladoPayload extends RealtimeEnvelopeMeta {
  pedidoId: string;
  motivo?: string;
  canal?: AdminRealtimeChannel;
}

export interface PagamentoDevolvidoPayload extends RealtimeEnvelopeMeta {
  pagamentoId: string;
  pedidoId?: string;
  valor?: string;
  canal?: AdminRealtimeChannel;
}

export interface EstoqueBloqueadoPayload extends RealtimeEnvelopeMeta {
  skuOuLote?: string;
  produtoId?: string;
  motivo?: string;
  canal?: AdminRealtimeChannel;
}

export interface NovoTicketPayload extends RealtimeEnvelopeMeta {
  ticketId: string;
  assunto?: string;
  prioridade?: string;
  canal?: AdminRealtimeChannel;
}

export type AdminRealtimePayload =
  | PedidoCanceladoPayload
  | PagamentoDevolvidoPayload
  | EstoqueBloqueadoPayload
  | NovoTicketPayload;
