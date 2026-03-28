import type { TFunction } from 'i18next';
import {
  AUTH_LOGIN_FAILED_CODE,
  INVALID_API_RESPONSE_CODE,
} from '../constants/errorCodes';
import { isNormalizedHttpError } from '../services/http/normalizeError';

/**
 * Converte erros técnicos / códigos estáveis em texto para o idioma atual (react-i18next).
 */
export function resolveLocalizedErrorMessage(error: unknown, t: TFunction): string {
  if (error instanceof Error && error.message === AUTH_LOGIN_FAILED_CODE) {
    return t('auth:errors.loginFailed');
  }
  if (error instanceof Error && error.message === INVALID_API_RESPONSE_CODE) {
    return t('common:errors.invalidApiResponse');
  }
  if (error instanceof DOMException && error.name === 'TimeoutError') {
    const match = /after (\d+)ms/.exec(error.message);
    const ms = match?.[1] ?? '';
    return t('common:errors.requestTimeout', { ms });
  }
  if (isNormalizedHttpError(error) && error.usedHttpFallback) {
    return t('common:errors.httpStatus', { status: error.status });
  }
  if (error instanceof TypeError && error.message === 'Failed to fetch') {
    return t('common:errors.network');
  }
  if (error instanceof Error && error.message.trim().length > 0) {
    return error.message;
  }
  return t('common:errors.unknown');
}
