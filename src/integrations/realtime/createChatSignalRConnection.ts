import { HubConnection, HubConnectionBuilder, LogLevel } from '@microsoft/signalr';
import { authService } from '../../modules/auth/services/authService';
import { getChatSignalRHubUrl } from './config';

const RECONNECT_DELAYS_MS = [0, 2000, 10000, 30000];

export interface ChatSignalRConnectionOptions {
  hubUrl?: string | null;
  /** Log SignalR no console (útil em desenvolvimento). */
  debug?: boolean;
  /** Re-inscreve grupos ou estado após reconexão automática. */
  onAfterReconnected?: (connection: HubConnection) => void;
}

/**
 * Conexão ao `ChatHub` com JWT: o cliente @microsoft/signalr envia o token como `access_token`
 * na query no transporte WebSocket, alinhado ao `JwtBearerEvents.OnMessageReceived` da API.
 */
export function createChatSignalRConnection(
  options: ChatSignalRConnectionOptions = {}
): HubConnection | null {
  const url = options.hubUrl ?? getChatSignalRHubUrl();
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

  connection.onreconnected(() => {
    options.onAfterReconnected?.(connection);
  });

  return connection;
}
