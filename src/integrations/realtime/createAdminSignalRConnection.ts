import { HubConnection, HubConnectionBuilder, LogLevel } from '@microsoft/signalr';
import { authService } from '../../modules/auth/services/authService';
import { getAdminSignalRHubUrl } from './config';
import { adminRealtimeMetrics } from './realtimeMetrics';

const RECONNECT_DELAYS_MS = [0, 2000, 10000, 30000];

export interface AdminSignalRConnectionOptions {
  hubUrl?: string | null;
  /** Log SignalR no console (útil em desenvolvimento). */
  debug?: boolean;
  /** Re-inscreve grupos/canais após reconexão automática. */
  onAfterReconnected?: (connection: HubConnection) => void;
}

/**
 * Constrói conexão SignalR com JWT (`accessTokenFactory`), reconexão automática e callbacks de métrica.
 */
export function createAdminSignalRConnection(
  options: AdminSignalRConnectionOptions = {}
): HubConnection | null {
  const url = options.hubUrl ?? getAdminSignalRHubUrl();
  if (!url) {
    return null;
  }

  const connection = new HubConnectionBuilder()
    .withUrl(url, {
      accessTokenFactory: () => authService.getAuthToken() ?? '',
    })
    .withAutomaticReconnect(RECONNECT_DELAYS_MS)
    .configureLogging(options.debug ? LogLevel.Information : LogLevel.Warning)
    .build();

  connection.onreconnecting(() => {
    adminRealtimeMetrics.recordReconnecting();
  });

  connection.onreconnected(() => {
    adminRealtimeMetrics.recordReconnected();
    options.onAfterReconnected?.(connection);
  });

  return connection;
}
