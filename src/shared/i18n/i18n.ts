import i18n from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { initReactI18next } from 'react-i18next';
import { ADMIN_I18N_STORAGE_KEY, DEFAULT_LANGUAGE, SUPPORTED_LANGUAGES } from './constants';
import { lazyJsonBackend } from './lazyJsonBackend';

function normalizeDetectedLanguage(lng: string): string {
  const lower = lng.toLowerCase();
  if (lower.startsWith('pt')) {
    return 'pt-BR';
  }
  if (lower.startsWith('zh')) {
    return 'zh-CN';
  }
  if (lower.startsWith('en')) {
    return 'en-US';
  }
  return DEFAULT_LANGUAGE;
}

const initPromise = i18n
  .use(lazyJsonBackend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: DEFAULT_LANGUAGE,
    supportedLngs: [...SUPPORTED_LANGUAGES],
    ns: ['common'],
    defaultNS: 'common',
    partialBundledLanguages: true,
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      lookupLocalStorage: ADMIN_I18N_STORAGE_KEY,
      caches: ['localStorage'],
    },
    react: {
      useSuspense: true,
    },
  });

function syncHtmlLang(lng: string): void {
  if (typeof document !== 'undefined') {
    document.documentElement.setAttribute('lang', lng);
  }
}

export const i18nReady: Promise<typeof i18n> = initPromise.then(async () => {
  const current = (i18n.resolvedLanguage ?? i18n.language) as string;
  const supported = SUPPORTED_LANGUAGES as readonly string[];
  if (!supported.includes(current)) {
    const normalized = normalizeDetectedLanguage(current);
    await i18n.changeLanguage(normalized);
  }
  syncHtmlLang(i18n.language);
  i18n.on('languageChanged', (lng) => {
    syncHtmlLang(lng);
  });
  return i18n;
});

export default i18n;
