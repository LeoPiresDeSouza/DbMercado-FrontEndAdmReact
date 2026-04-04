/** Mantém apenas dígitos ASCII 0–9 (NCM/CEST frequentemente colados com pontos ou espaços). */
export function somenteDigitosAscii(s: string): string {
  let out = '';
  for (let i = 0; i < s.length; i++) {
    const c = s.charCodeAt(i);
    if (c >= 48 && c <= 57) out += s[i];
  }
  return out;
}
