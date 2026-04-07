/**
 * Compara códigos BCP-47 do chat (pt-BR, en, zh-CN) de forma tolerante a maiúsculas e espaços.
 */
export function idiomasChatEquivalentes(a: string, b: string): boolean {
  return a.trim().toLowerCase() === b.trim().toLowerCase();
}

/** Códigos aceitos pela API (`LanguageCode` no backend). */
export const CHAT_LANGUAGE_CODES = ['pt-BR', 'en', 'zh-CN'] as const;

export type ChatLanguageCode = (typeof CHAT_LANGUAGE_CODES)[number];

export function normalizarCodigoIdiomaChat(valor: string): ChatLanguageCode | null {
  const v = valor.trim();
  for (const code of CHAT_LANGUAGE_CODES) {
    if (idiomasChatEquivalentes(v, code)) {
      return code;
    }
  }
  return null;
}
