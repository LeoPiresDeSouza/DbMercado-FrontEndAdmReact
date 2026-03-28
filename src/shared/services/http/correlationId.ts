const CORRELATION_HEX = '0123456789abcdef';

/** Gera ID único por requisição (compatível com ambientes sem crypto.randomUUID). */
export function generateCorrelationId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  let id = '';
  for (let i = 0; i < 32; i += 1) {
    id += CORRELATION_HEX[Math.floor(Math.random() * 16)];
  }
  return id;
}
