import i18n from '../../shared/i18n/i18n';
import type { NotificationSeverity } from '../../shared/types';
import type {
  EstoqueBloqueadoPayload,
  NovoTicketPayload,
  PagamentoDevolvidoPayload,
  PedidoCanceladoPayload,
} from './types';

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null;
}

export function pickMeta(payload: unknown): { emittedAtUtc?: string; clientSentAtUtc?: string } {
  if (!isRecord(payload)) {
    return {};
  }
  const emittedAtUtc =
    typeof payload.emittedAtUtc === 'string' ? payload.emittedAtUtc : undefined;
  const clientSentAtUtc =
    typeof payload.clientSentAtUtc === 'string' ? payload.clientSentAtUtc : undefined;
  return { emittedAtUtc, clientSentAtUtc };
}

export function toastFromPedidoCancelado(payload: unknown): {
  title: string;
  body?: string;
  severity: NotificationSeverity;
} {
  const p = payload as Partial<PedidoCanceladoPayload>;
  const id =
    typeof p.pedidoId === 'string' ? p.pedidoId : i18n.t('common:realtime.placeholderDash');
  return {
    title: i18n.t('common:realtime.pedidoCanceladoTitle'),
    body: p.motivo
      ? i18n.t('common:realtime.pedidoCanceladoBodyWithReason', { id, reason: p.motivo })
      : i18n.t('common:realtime.pedidoCanceladoBody', { id }),
    severity: 'warning',
  };
}

export function toastFromPagamentoDevolvido(payload: unknown): {
  title: string;
  body?: string;
  severity: NotificationSeverity;
} {
  const p = payload as Partial<PagamentoDevolvidoPayload>;
  const id =
    typeof p.pagamentoId === 'string' ? p.pagamentoId : i18n.t('common:realtime.placeholderDash');
  const bits: string[] = [];
  if (p.valor) {
    bits.push(i18n.t('common:realtime.pagamentoValue', { valor: p.valor }));
  }
  if (p.pedidoId) {
    bits.push(i18n.t('common:realtime.pagamentoOrderRef', { pedidoId: p.pedidoId }));
  }
  const sep = i18n.t('common:realtime.inlineSeparator');
  const body =
    bits.length > 0
      ? bits.join(sep)
      : i18n.t('common:realtime.pagamentoBodyFallback', { id });
  return {
    title: i18n.t('common:realtime.pagamentoDevolvidoTitle'),
    body,
    severity: 'warning',
  };
}

export function toastFromEstoqueBloqueado(payload: unknown): {
  title: string;
  body?: string;
  severity: NotificationSeverity;
} {
  const p = payload as Partial<EstoqueBloqueadoPayload>;
  const sku =
    p.skuOuLote ?? p.produtoId ?? i18n.t('common:realtime.estoqueItemFallback');
  return {
    title: i18n.t('common:realtime.estoqueBloqueadoTitle'),
    body: p.motivo
      ? i18n.t('common:realtime.estoqueBodyWithReason', { sku, reason: p.motivo })
      : String(sku),
    severity: 'error',
  };
}

export function toastFromNovoTicket(payload: unknown): {
  title: string;
  body?: string;
  severity: NotificationSeverity;
} {
  const p = payload as Partial<NovoTicketPayload>;
  const id =
    typeof p.ticketId === 'string' ? p.ticketId : i18n.t('common:realtime.placeholderDash');
  return {
    title: i18n.t('common:realtime.novoTicketTitle'),
    body: p.assunto
      ? i18n.t('common:realtime.novoTicketBodyWithSubject', { id, assunto: p.assunto })
      : i18n.t('common:realtime.novoTicketBodyFallback', { id }),
    severity: 'info',
  };
}
