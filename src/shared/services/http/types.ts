import type { ZodType } from 'zod';

/** Identificador lógico do backend (telemetria, logs, erros). */
export type HttpBackendId = 'dotnet';

export interface StructuredLogEvent {
  event: string;
  timestamp: string;
  backendId: HttpBackendId;
  correlationId: string;
  [key: string]: string | number | boolean | undefined | null;
}

export interface StructuredLogger {
  debug: (evt: StructuredLogEvent) => void;
  info: (evt: StructuredLogEvent) => void;
  warn: (evt: StructuredLogEvent) => void;
  error: (evt: StructuredLogEvent) => void;
}

/**
 * Provedor de tokens para uso com ApiClient (implementação tipicamente no módulo auth).
 * Mantido em shared para extração futura em package comum (web + mobile).
 */
export interface HttpTokenProvider {
  getAccessToken: () => string | null;
  /** Renova o access token; retorna o novo JWT ou null se falhar. */
  refreshAccessToken: () => Promise<string | null>;
  /**
   * Chamado antes do primeiro envio em rotas autenticadas (ex.: renovar access se estiver expirado
   * ou a expirar em breve), para reduzir 401 evitáveis. Opcional.
   */
  prepareAuthenticatedRequest?: () => Promise<void>;
  /** Sessão inválida após 401 + refresh falho (ex.: redirect login). */
  onAuthFailure?: () => void;
}

export interface ApiClientConfig {
  baseUrl: string;
  backendId: HttpBackendId;
  /** Timeout padrão por requisição (ms). */
  defaultTimeoutMs: number;
  /** Tentativas adicionais após a primeira (só métodos seguros ou quando retries explícito). */
  defaultRetries: number;
  baseDelayMs: number;
  maxDelayMs: number;
  tokenProvider?: HttpTokenProvider;
  /** Rotas que não recebem Authorization (paths relativos à base, prefix match). */
  publicPathPrefixes: string[];
  logger: StructuredLogger;
  correlationIdHeaderName: string;
}

export interface ApiRequestInit extends RequestInit {
  timeoutMs?: number;
  /** Sobrescreve defaultRetries do client; -1 desativa retry. */
  retries?: number;
  skipAuth?: boolean;
  /** Se omitido, um novo ID é gerado por requisição. */
  correlationId?: string;
}

export interface CreateApiClientOptions {
  baseUrl: string;
  backendId: HttpBackendId;
  defaultTimeoutMs?: number;
  defaultRetries?: number;
  baseDelayMs?: number;
  maxDelayMs?: number;
  tokenProvider?: HttpTokenProvider;
  publicPathPrefixes?: string[];
  logger?: StructuredLogger;
  correlationIdHeaderName?: string;
}

export interface ApiClient {
  readonly backendId: HttpBackendId;
  readonly baseUrl: string;
  request(path: string, init?: ApiRequestInit): Promise<Response>;
  requestJson<T>(path: string, init?: ApiRequestInit, schema?: ZodType<T>): Promise<T>;
}
