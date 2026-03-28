import type { AdminRealtimeChannel } from './types';

const MAX_LATENCY_SAMPLES = 100;

export interface RealtimeMetricsSnapshot {
  connectAttempts: number;
  successfulConnections: number;
  reconnectCycles: number;
  /** Tentativas de reconexão automática (onReconnecting). */
  reconnectingEvents: number;
  disconnects: number;
  lastDisconnectReason: string | null;
  messagesByChannel: Record<string, number>;
  messagesByEvent: Record<string, number>;
  latencyMs: {
    count: number;
    avg: number;
    p95Approx: number;
    last: number | null;
  };
  lastConnectedAtUtc: string | null;
  updatedAtUtc: string;
}

function nowIso(): string {
  return new Date().toISOString();
}

class RealtimeMetricsCollector {
  connectAttempts = 0;

  successfulConnections = 0;

  reconnectCycles = 0;

  reconnectingEvents = 0;

  disconnects = 0;

  lastDisconnectReason: string | null = null;

  messagesByChannel: Record<string, number> = {};

  messagesByEvent: Record<string, number> = {};

  private latencySamples: number[] = [];

  lastLatencyMs: number | null = null;

  lastConnectedAtUtc: string | null = null;

  recordConnectAttempt(): void {
    this.connectAttempts += 1;
  }

  recordConnected(): void {
    this.successfulConnections += 1;
    this.lastConnectedAtUtc = nowIso();
  }

  recordReconnecting(): void {
    this.reconnectingEvents += 1;
  }

  recordReconnected(): void {
    this.reconnectCycles += 1;
    this.lastConnectedAtUtc = nowIso();
  }

  recordDisconnect(reason?: Error | null): void {
    this.disconnects += 1;
    this.lastDisconnectReason = reason?.message ?? null;
  }

  recordInboundMessage(
    channel: AdminRealtimeChannel | 'unknown',
    eventName: string,
    meta?: { emittedAtUtc?: string; clientSentAtUtc?: string }
  ): void {
    const ch = channel;
    this.messagesByChannel[ch] = (this.messagesByChannel[ch] ?? 0) + 1;
    this.messagesByEvent[eventName] = (this.messagesByEvent[eventName] ?? 0) + 1;

    const serverTs = meta?.emittedAtUtc ? Date.parse(meta.emittedAtUtc) : NaN;
    if (!Number.isNaN(serverTs)) {
      const lag = Math.max(0, Date.now() - serverTs);
      this.pushLatencySample(lag);
      return;
    }
    const clientEcho = meta?.clientSentAtUtc ? Date.parse(meta.clientSentAtUtc) : NaN;
    if (!Number.isNaN(clientEcho)) {
      const rtt = Math.max(0, Date.now() - clientEcho);
      this.pushLatencySample(rtt);
    }
  }

  private pushLatencySample(ms: number): void {
    this.lastLatencyMs = ms;
    this.latencySamples.push(ms);
    if (this.latencySamples.length > MAX_LATENCY_SAMPLES) {
      this.latencySamples.shift();
    }
  }

  getSnapshot(): RealtimeMetricsSnapshot {
    const sorted = [...this.latencySamples].sort((a, b) => a - b);
    const count = sorted.length;
    const avg = count > 0 ? sorted.reduce((a, b) => a + b, 0) / count : 0;
    const p95Idx = count > 0 ? Math.min(count - 1, Math.floor(count * 0.95)) : 0;
    const p95Approx = count > 0 ? sorted[p95Idx] ?? 0 : 0;

    return {
      connectAttempts: this.connectAttempts,
      successfulConnections: this.successfulConnections,
      reconnectCycles: this.reconnectCycles,
      reconnectingEvents: this.reconnectingEvents,
      disconnects: this.disconnects,
      lastDisconnectReason: this.lastDisconnectReason,
      messagesByChannel: { ...this.messagesByChannel },
      messagesByEvent: { ...this.messagesByEvent },
      latencyMs: {
        count,
        avg: Math.round(avg * 10) / 10,
        p95Approx,
        last: this.lastLatencyMs,
      },
      lastConnectedAtUtc: this.lastConnectedAtUtc,
      updatedAtUtc: nowIso(),
    };
  }

  reset(): void {
    this.connectAttempts = 0;
    this.successfulConnections = 0;
    this.reconnectCycles = 0;
    this.reconnectingEvents = 0;
    this.disconnects = 0;
    this.lastDisconnectReason = null;
    this.messagesByChannel = {};
    this.messagesByEvent = {};
    this.latencySamples = [];
    this.lastLatencyMs = null;
    this.lastConnectedAtUtc = null;
  }
}

export const adminRealtimeMetrics = new RealtimeMetricsCollector();

/** Exposto para debug / futuro painel de observabilidade. */
export function getAdminRealtimeMetricsSnapshot(): RealtimeMetricsSnapshot {
  return adminRealtimeMetrics.getSnapshot();
}
