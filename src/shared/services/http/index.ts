/**
 * Camada HTTP enterprise — candidata a package `@dbmercado/http-client` (web + mobile).
 * Não importar módulos de UI ou `integrations` daqui.
 */
export { createApiClient } from './apiClient';
export { generateCorrelationId } from './correlationId';
export {
  NormalizedHttpError,
  buildErrorMessageFromBody,
  isNormalizedHttpError,
  normalizeHttpError,
  normalizedErrorBodySchema,
  type NormalizedErrorBody,
} from './normalizeError';
export {
  computeBackoffMs,
  isRetriableHttpStatus,
  isRetriableNetworkError,
  sleepMs,
} from './retryWithBackoff';
export {
  createConsoleStructuredLogger,
  defaultStructuredLogger,
  logHttpRequest,
  logHttpResponse,
} from './structuredLogger';
export { fetchWithTimeout } from './fetchWithTimeout';
export type {
  ApiClient,
  ApiClientConfig,
  ApiRequestInit,
  CreateApiClientOptions,
  HttpBackendId,
  HttpTokenProvider,
  StructuredLogEvent,
  StructuredLogger,
} from './types';
