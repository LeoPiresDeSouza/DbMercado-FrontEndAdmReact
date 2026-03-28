import type { HubConnection } from '@microsoft/signalr';
import type { AdminRealtimeChannel } from './types';

/**
 * Convida o servidor a associar a conexão aos grupos de canal.
 * O hub .NET deve expor um método compatível (ex.: `SubscribeToChannel(string channel)`).
 * Falhas são ignoradas até o backend implementar o contrato.
 */
export async function subscribeAdminRealtimeChannels(
  connection: HubConnection,
  channels: readonly AdminRealtimeChannel[]
): Promise<void> {
  for (const channel of channels) {
    try {
      await connection.invoke('SubscribeToChannel', channel);
    } catch {
      try {
        await connection.invoke('subscribeToChannel', channel);
      } catch {
        /* hub ainda sem método — infra preparada */
      }
    }
  }
}
