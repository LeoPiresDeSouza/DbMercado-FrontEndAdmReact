/**
 * fetch com AbortController por timeout; respeita signal externo do init.
 */
export async function fetchWithTimeout(
  url: string,
  init: RequestInit,
  timeoutMs: number
): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  const external = init.signal;
  const onExternalAbort = (): void => {
    clearTimeout(timeoutId);
    controller.abort();
  };

  if (external) {
    if (external.aborted) {
      clearTimeout(timeoutId);
      throw new DOMException('The operation was aborted.', 'AbortError');
    }
    external.addEventListener('abort', onExternalAbort, { once: true });
  }

  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } catch (e: unknown) {
    if (e instanceof DOMException && e.name === 'AbortError') {
      const abortedByTimeout = !external?.aborted;
      if (abortedByTimeout) {
        throw new DOMException(`Request timed out after ${timeoutMs}ms`, 'TimeoutError');
      }
    }
    throw e;
  } finally {
    clearTimeout(timeoutId);
    if (external) {
      external.removeEventListener('abort', onExternalAbort);
    }
  }
}
