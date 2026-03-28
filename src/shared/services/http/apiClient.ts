import type { ZodType } from 'zod';
import { parseJsonWithSchema } from '../../utils/parseJson';
import { readResponseJsonUnknown } from '../../utils/readJson';
import { generateCorrelationId } from './correlationId';
import { fetchWithTimeout } from './fetchWithTimeout';
import { normalizeHttpError } from './normalizeError';
import {
  computeBackoffMs,
  isRetriableHttpStatus,
  isRetriableNetworkError,
  sleepMs,
} from './retryWithBackoff';
import { defaultStructuredLogger, logHttpRequest, logHttpResponse } from './structuredLogger';
import type {
  ApiClient,
  ApiClientConfig,
  ApiRequestInit,
  CreateApiClientOptions,
} from './types';

function normalizeBaseUrl(baseUrl: string): string {
  return baseUrl.replace(/\/$/, '');
}

function resolveUrl(baseUrl: string, path: string): string {
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${baseUrl}${cleanPath}`;
}

function isPublicPath(path: string, prefixes: string[]): boolean {
  const p = path.split('?')[0] ?? path;
  return prefixes.some((pre) => p === pre || p.startsWith(`${pre}/`));
}

function resolveMaxRetries(
  method: string,
  init: ApiRequestInit,
  defaultRetries: number
): number {
  if (init.retries === -1) {
    return 0;
  }
  if (init.retries !== undefined) {
    return init.retries;
  }
  const m = method.toUpperCase();
  if (m === 'GET' || m === 'HEAD' || m === 'OPTIONS') {
    return defaultRetries;
  }
  return 0;
}

/**
 * Cliente HTTP enterprise: Bearer opcional, refresh em 401, timeout, retry com backoff,
 * correlation id e erros normalizados.
 *
 * Conteúdo portável para package compartilhado: depende apenas de `fetch` e tipos em `./types`.
 */
export function createApiClient(options: CreateApiClientOptions): ApiClient {
  const config: ApiClientConfig = {
    baseUrl: normalizeBaseUrl(options.baseUrl),
    backendId: options.backendId,
    defaultTimeoutMs: options.defaultTimeoutMs ?? 30_000,
    defaultRetries: options.defaultRetries ?? 2,
    baseDelayMs: options.baseDelayMs ?? 300,
    maxDelayMs: options.maxDelayMs ?? 10_000,
    tokenProvider: options.tokenProvider,
    publicPathPrefixes: options.publicPathPrefixes ?? ['/api/Auth/login', '/api/Auth/refresh'],
    logger: options.logger ?? defaultStructuredLogger,
    correlationIdHeaderName: options.correlationIdHeaderName ?? 'X-Correlation-Id',
  };

  async function runRefresh(): Promise<string | null> {
    if (!config.tokenProvider) {
      return null;
    }
    return config.tokenProvider.refreshAccessToken();
  }

  async function singleFetch(
    path: string,
    init: ApiRequestInit,
    accessToken: string | null,
    correlationId: string
  ): Promise<Response> {
    const url = resolveUrl(config.baseUrl, path);
    const timeoutMs = init.timeoutMs ?? config.defaultTimeoutMs;
    const headers = new Headers(init.headers);
    headers.set(config.correlationIdHeaderName, correlationId);

    const method = (init.method ?? 'GET').toUpperCase();
    const hasBody = init.body !== undefined && init.body !== null;
    if (hasBody && !headers.has('Content-Type') && !(init.body instanceof FormData)) {
      headers.set('Content-Type', 'application/json');
    }

    const skipAuth = init.skipAuth ?? isPublicPath(path, config.publicPathPrefixes);
    if (!skipAuth && accessToken) {
      headers.set('Authorization', `Bearer ${accessToken}`);
    }

    logHttpRequest(config.logger, config.backendId, correlationId, method, url);
    const started = typeof performance !== 'undefined' ? performance.now() : Date.now();

    try {
      const res = await fetchWithTimeout(
        url,
        {
          ...init,
          headers,
          credentials: init.credentials ?? 'include',
        },
        timeoutMs
      );
      const duration =
        typeof performance !== 'undefined'
          ? Math.round(performance.now() - started)
          : Math.round(Date.now() - started);
      logHttpResponse(config.logger, config.backendId, correlationId, method, url, res.status, duration);
      return res;
    } catch (e: unknown) {
      const duration =
        typeof performance !== 'undefined'
          ? Math.round(performance.now() - started)
          : Math.round(Date.now() - started);
      logHttpResponse(config.logger, config.backendId, correlationId, method, url, 0, duration);
      throw e;
    }
  }

  async function executeWithRetries(
    path: string,
    init: ApiRequestInit,
    accessToken: string | null,
    correlationId: string
  ): Promise<Response> {
    const method = (init.method ?? 'GET').toUpperCase();
    const maxRetry = resolveMaxRetries(method, init, config.defaultRetries);
    let lastResponse: Response | null = null;

    for (let attempt = 0; attempt <= maxRetry; attempt += 1) {
      try {
        const res = await singleFetch(path, init, accessToken, correlationId);
        lastResponse = res;
        if (res.ok || res.status === 401) {
          return res;
        }
        if (attempt < maxRetry && isRetriableHttpStatus(res.status)) {
          await sleepMs(computeBackoffMs(attempt, config.baseDelayMs, config.maxDelayMs));
          continue;
        }
        return res;
      } catch (error: unknown) {
        if (attempt < maxRetry && isRetriableNetworkError(error)) {
          await sleepMs(computeBackoffMs(attempt, config.baseDelayMs, config.maxDelayMs));
          continue;
        }
        throw error;
      }
    }

    return lastResponse ?? new Response(null, { status: 599, statusText: 'Unknown' });
  }

  const client: ApiClient = {
    backendId: config.backendId,
    baseUrl: config.baseUrl,

    async request(path: string, init: ApiRequestInit = {}): Promise<Response> {
      const correlationId = init.correlationId ?? generateCorrelationId();
      const skipAuth = init.skipAuth ?? isPublicPath(path, config.publicPathPrefixes);

      let accessToken: string | null = null;
      if (!skipAuth && config.tokenProvider) {
        accessToken = config.tokenProvider.getAccessToken();
      }

      let response = await executeWithRetries(path, init, accessToken, correlationId);

      if (response.status === 401 && !skipAuth && config.tokenProvider) {
        const newToken = await runRefresh();
        if (newToken) {
          response = await executeWithRetries(path, init, newToken, correlationId);
        }
        if (response.status === 401) {
          config.tokenProvider?.onAuthFailure?.();
          const body = await readResponseJsonUnknown(response.clone());
          throw normalizeHttpError(response, config.backendId, correlationId, body);
        }
      }

      return response;
    },

    async requestJson<T>(path: string, init: ApiRequestInit = {}, schema?: ZodType<T>): Promise<T> {
      const correlationId = init.correlationId ?? generateCorrelationId();
      const response = await client.request(path, { ...init, correlationId });
      const raw = await readResponseJsonUnknown(response);

      if (!response.ok) {
        throw normalizeHttpError(response, config.backendId, correlationId, raw);
      }

      if (schema) {
        return parseJsonWithSchema(schema, raw);
      }
      return raw as T;
    },
  };

  return client;
}
