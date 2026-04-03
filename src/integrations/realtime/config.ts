import { DOTNET_API_BASE_URL } from '../dotnet-api/config';

/**
 * URL completa do hub SignalR administrativo.
 * Ex.: `https://api.exemplo.com/hubs/admin` ou `ws://localhost:5046/hubs/admin` (conforme hosting).
 */
export function getAdminSignalRHubUrl(): string | null {
  const explicit = import.meta.env.VITE_SIGNALR_HUB_URL?.trim();
  if (explicit) {
    return explicit;
  }
  const base = DOTNET_API_BASE_URL.replace(/\/$/, '');
  if (!base) {
    return null;
  }
  return `${base}/hubs/admin`;
}

/**
 * Controle de ativação (evita erros no console enquanto o hub .NET não existir).
 * - `VITE_REALTIME_ENABLED=true` — usa URL explícita ou `{API}/hubs/admin`.
 * - `VITE_SIGNALR_HUB_URL` definida — ativa mesmo sem a flag (útil em dev).
 * - `VITE_REALTIME_ENABLED=false` — força desligado.
 */
export function isAdminRealtimeEnabled(): boolean {
  if (import.meta.env.VITE_REALTIME_ENABLED === 'false') {
    return false;
  }
  if (import.meta.env.VITE_SIGNALR_HUB_URL?.trim()) {
    return true;
  }
  if (import.meta.env.VITE_REALTIME_ENABLED === 'true') {
    return getAdminSignalRHubUrl() !== null;
  }
  return false;
}
