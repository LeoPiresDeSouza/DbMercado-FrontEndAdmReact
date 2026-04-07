/// <reference types="vite/client" />

declare module '*.css' {
  const content: Record<string, string>;
  export default content;
}

interface ImportMetaEnv {
  readonly VITE_DOTNET_API_BASE_URL?: string;
  readonly VITE_API_BASE_URL?: string;
  readonly VITE_SIGNALR_HUB_URL?: string;
  /** Hub do chat multilíngue; se vazio, usa `{API}/hubs/chat` (ver `getChatSignalRHubUrl`). */
  readonly VITE_CHAT_SIGNALR_HUB_URL?: string;
  readonly VITE_REALTIME_ENABLED?: string;
  readonly VITE_AG_GRID_LICENSE_KEY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
