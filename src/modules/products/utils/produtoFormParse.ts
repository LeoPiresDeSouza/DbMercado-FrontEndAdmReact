/** Converte texto de input (vírgula ou ponto) em número finito, ou `null` se inválido/vazio. */
export function parseDecimalDoFormulario(raw: string): number | null {
  const s = String(raw ?? '')
    .trim()
    .replace(/\s+/g, '')
    .replace(',', '.');
  if (s === '' || s === '-' || s === '+') {
    return null;
  }
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
}
