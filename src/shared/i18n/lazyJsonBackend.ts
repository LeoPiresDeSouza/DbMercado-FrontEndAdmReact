import type { BackendModule } from 'i18next';
import type { AdminI18nNamespace } from './constants';
import { ADMIN_I18N_NAMESPACES, SUPPORTED_LANGUAGES, type SupportedLanguage } from './constants';

function isSupportedLng(lng: string): lng is SupportedLanguage {
  return (SUPPORTED_LANGUAGES as readonly string[]).includes(lng);
}

function isNamespace(ns: string): ns is AdminI18nNamespace {
  return (ADMIN_I18N_NAMESPACES as readonly string[]).includes(ns);
}

/**
 * Carrega JSON por idioma/namespace em chunk separado (webpack code-splitting).
 * Copiar `locales/` + este módulo para package `@dbmercado/i18n-resources` se desejado.
 */
export const lazyJsonBackend: BackendModule = {
  type: 'backend',
  init(): void {},
  read(language: string, namespace: string, callback: (err: Error | null, data: boolean | object | null) => void): void {
    if (!isSupportedLng(language) || !isNamespace(namespace)) {
      callback(new Error(`Unsupported i18n bundle: ${language}/${namespace}`), null);
      return;
    }

    const load = (): Promise<{ default: Record<string, unknown> }> => {
      switch (language) {
        case 'pt-BR':
          return import(/* webpackChunkName: "i18n-pt-BR-[request]" */ `./locales/pt-BR/${namespace}.json`);
        case 'en-US':
          return import(/* webpackChunkName: "i18n-en-US-[request]" */ `./locales/en-US/${namespace}.json`);
        case 'zh-CN':
          return import(/* webpackChunkName: "i18n-zh-CN-[request]" */ `./locales/zh-CN/${namespace}.json`);
      }
    };

    void load()
      .then((mod) => {
        callback(null, mod.default);
      })
      .catch((err: unknown) => {
        const e = err instanceof Error ? err : new Error(String(err));
        callback(e, null);
      });
  },
};
