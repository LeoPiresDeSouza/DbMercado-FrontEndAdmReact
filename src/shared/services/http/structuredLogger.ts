import type { HttpBackendId, StructuredLogEvent, StructuredLogger } from './types';

function ts(): string {
  return new Date().toISOString();
}

function baseFields(backendId: HttpBackendId, correlationId: string): Pick<StructuredLogEvent, 'timestamp' | 'backendId' | 'correlationId'> {
  return { timestamp: ts(), backendId, correlationId };
}

/**
 * Logger JSON-friendly para console / futuro sink (OpenTelemetry, etc.).
 */
export function createConsoleStructuredLogger(): StructuredLogger {
  const emit = (level: string, evt: StructuredLogEvent): void => {
    const line = JSON.stringify({ level, ...evt });
    if (level === 'debug') {
      console.debug(line);
    } else if (level === 'info') {
      console.info(line);
    } else if (level === 'warn') {
      console.warn(line);
    } else {
      console.error(line);
    }
  };

  return {
    debug: (evt) => emit('debug', evt),
    info: (evt) => emit('info', evt),
    warn: (evt) => emit('warn', evt),
    error: (evt) => emit('error', evt),
  };
}

export const defaultStructuredLogger = createConsoleStructuredLogger();

export function logHttpRequest(
  logger: StructuredLogger,
  backendId: HttpBackendId,
  correlationId: string,
  method: string,
  url: string
): void {
  logger.info({
    event: 'http.request',
    ...baseFields(backendId, correlationId),
    method,
    url,
  });
}

export function logHttpResponse(
  logger: StructuredLogger,
  backendId: HttpBackendId,
  correlationId: string,
  method: string,
  url: string,
  status: number,
  durationMs: number
): void {
  const payload: StructuredLogEvent = {
    event: 'http.response',
    ...baseFields(backendId, correlationId),
    method,
    url,
    status,
    durationMs,
  };
  if (status >= 500) {
    logger.error(payload);
  } else if (status >= 400) {
    logger.warn(payload);
  } else {
    logger.info(payload);
  }
}
