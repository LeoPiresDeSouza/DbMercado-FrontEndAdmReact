import React, { useEffect, useRef } from 'react';
import type { HubConnection } from '@microsoft/signalr';
import { authService } from '../../modules/auth/services/authService';
import { useAuthStore } from '../../shared/stores/authStore';
import { registerAdminHubHandlers, unregisterAdminHubHandlers } from './adminHubHandlers';
import { createAdminSignalRConnection } from './createAdminSignalRConnection';
import { isAdminRealtimeEnabled } from './config';
import { adminRealtimeMetrics } from './realtimeMetrics';
import { subscribeAdminRealtimeChannels } from './subscribeChannels';
import { ADMIN_REALTIME_CHANNELS } from './types';

async function syncRealtimeTenantContext(
  connection: HubConnection,
  tenantId: string | null
): Promise<void> {
  try {
    await connection.invoke('SetTenantContext', tenantId ?? '');
  } catch {
    try {
      await connection.invoke('setTenantContext', tenantId ?? '');
    } catch {
      /* contrato opcional no hub .NET */
    }
  }
}

async function startAdminRealtimeSession(
  connection: HubConnection,
  tenantId: string | null
): Promise<void> {
  adminRealtimeMetrics.recordConnectAttempt();
  await connection.start();
  adminRealtimeMetrics.recordConnected();
  await subscribeAdminRealtimeChannels(connection, ADMIN_REALTIME_CHANNELS);
  await syncRealtimeTenantContext(connection, tenantId);
}

/**
 * Mantém uma sessão SignalR autenticada (JWT) enquanto houver sessão admin válida.
 * Eventos viram toasts via `notificationCenterStore`.
 */
export function AdminRealtimeProvider({
  children,
}: {
  children: React.ReactNode;
}): React.ReactElement {
  const sessionRevision = useAuthStore((s) => s.sessionRevision);
  const tenantId = useAuthStore((s) => s.tenantId);
  const connectionRef = useRef<HubConnection | null>(null);

  useEffect(() => {
    if (!isAdminRealtimeEnabled()) {
      return;
    }

    if (!authService.isAuthenticated()) {
      const existing = connectionRef.current;
      if (existing) {
        unregisterAdminHubHandlers(existing);
        adminRealtimeMetrics.recordDisconnect(undefined);
        void existing.stop();
        connectionRef.current = null;
      }
      return;
    }

    const connection = createAdminSignalRConnection({
      debug: process.env.NODE_ENV === 'development',
      onAfterReconnected: (conn) => {
        void (async () => {
          await subscribeAdminRealtimeChannels(conn, ADMIN_REALTIME_CHANNELS);
          await syncRealtimeTenantContext(conn, useAuthStore.getState().tenantId);
        })();
      },
    });

    if (!connection) {
      return;
    }

    registerAdminHubHandlers(connection);
    connectionRef.current = connection;

    void startAdminRealtimeSession(connection, tenantId).catch((e: unknown) => {
      console.warn('[realtime] Failed to connect to admin SignalR hub:', e);
    });

    return () => {
      unregisterAdminHubHandlers(connection);
      adminRealtimeMetrics.recordDisconnect(undefined);
      void connection.stop();
      if (connectionRef.current === connection) {
        connectionRef.current = null;
      }
    };
  }, [sessionRevision, tenantId]);

  return <>{children}</>;
}
