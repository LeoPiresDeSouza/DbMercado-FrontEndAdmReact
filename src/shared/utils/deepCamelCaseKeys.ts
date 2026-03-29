/**
 * Converte chaves de objetos JSON no estilo PascalCase (.NET) para camelCase, recursivamente.
 * Usado como fallback quando a API não aplica PropertyNamingPolicy.CamelCase.
 */
export function deepCamelCaseKeys(value: unknown): unknown {
  if (value === null || typeof value !== 'object') {
    return value;
  }
  if (Array.isArray(value)) {
    return value.map((item) => deepCamelCaseKeys(item));
  }
  const out: Record<string, unknown> = {};
  for (const [key, v] of Object.entries(value as Record<string, unknown>)) {
    const camel = key.length === 0 ? key : key.charAt(0).toLowerCase() + key.slice(1);
    out[camel] = deepCamelCaseKeys(v);
  }
  return out;
}
