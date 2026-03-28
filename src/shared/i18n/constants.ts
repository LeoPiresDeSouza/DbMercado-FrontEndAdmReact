/** Chave localStorage — mesma chave pode ser usada no app mobile para paridade. */
export const ADMIN_I18N_STORAGE_KEY = 'dbmercado_admin_locale';

export const SUPPORTED_LANGUAGES = ['pt-BR', 'en-US', 'zh-CN'] as const;

export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];

export const DEFAULT_LANGUAGE: SupportedLanguage = 'pt-BR';

/**
 * Namespaces versionados para lazy load. Extrair pasta `locales/` + este arquivo para package compartilhado.
 */
export const ADMIN_I18N_NAMESPACES = [
  'common',
  'auth',
  'dashboard',
  'users',
  'roles',
  'audit',
] as const;

export type AdminI18nNamespace = (typeof ADMIN_I18N_NAMESPACES)[number];
