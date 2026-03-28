/**
 * i18n administrativo — extrair `locales/` + `constants.ts` + `lazyJsonBackend.ts` para package compartilhado (mobile pode usar `i18next` + imports estáticos ou mesma estrutura de pastas).
 */
export {
  ADMIN_I18N_NAMESPACES,
  ADMIN_I18N_STORAGE_KEY,
  DEFAULT_LANGUAGE,
  SUPPORTED_LANGUAGES,
  type AdminI18nNamespace,
  type SupportedLanguage,
} from './constants';
export { lazyJsonBackend } from './lazyJsonBackend';
export { default as i18n, i18nReady } from './i18n';
