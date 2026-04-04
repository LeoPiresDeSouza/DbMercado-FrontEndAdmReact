import { DOTNET_API_BASE_URL } from '../../../integrations/dotnet-api/config';
import { AUTH_LOGIN_FAILED_CODE } from '../../../shared/constants/errorCodes';
import {
  apiErrorBodySchema,
  authTokenDtoSchema,
  type AuthTokenDto,
} from '../../../shared/types';
import { parseJsonWithSchema } from '../../../shared/utils/parseJson';
import { readResponseJsonUnknown } from '../../../shared/utils/readJson';

const STORAGE = {
  accessToken: 'jwt_token',
  accessExpiration: 'jwt_expiration',
  refreshToken: 'jwt_refresh_token',
  refreshExpiration: 'jwt_refresh_expiration',
} as const;

export interface AuthServiceApi {
  login: (email: string, password: string) => Promise<AuthTokenDto>;
  /** Persiste access + refresh (login / refresh). */
  setTokens: (dto: AuthTokenDto) => void;
  getAuthToken: () => string | null;
  getRefreshToken: () => string | null;
  isAuthenticated: () => boolean;
  logout: () => void;
  /**
   * Renova o JWT via API .NET (single-flight).
   * Usado pelo `ApiClient` enterprise; não usar `fetch` direto nos módulos para APIs autenticadas.
   */
  refreshAccessTokenFromApi: () => Promise<string | null>;
  /**
   * Se o refresh ainda for válido e o access estiver ausente, expirado ou a expirar em breve,
   * pede novo par de tokens antes do pedido HTTP (complementa o refresh reativo em 401).
   */
  ensureAccessTokenFreshIfNeeded: () => Promise<void>;
}

let refreshInFlight: Promise<string | null> | null = null;

function clearStorage(): void {
  localStorage.removeItem(STORAGE.accessToken);
  localStorage.removeItem(STORAGE.accessExpiration);
  localStorage.removeItem(STORAGE.refreshToken);
  localStorage.removeItem(STORAGE.refreshExpiration);
}

function isAccessStillValid(): boolean {
  const token = localStorage.getItem(STORAGE.accessToken);
  const expiration = localStorage.getItem(STORAGE.accessExpiration);
  if (!token || !expiration) {
    return false;
  }
  const expMs = new Date(expiration).getTime();
  return !Number.isNaN(expMs) && Date.now() < expMs;
}

function isRefreshStillValid(): boolean {
  const rt = localStorage.getItem(STORAGE.refreshToken);
  const exp = localStorage.getItem(STORAGE.refreshExpiration);
  if (!rt || !exp) {
    return false;
  }
  const expMs = new Date(exp).getTime();
  return !Number.isNaN(expMs) && Date.now() < expMs;
}

/** True se a data de expiração do access existir e faltar menos de `bufferMs` ms. */
function accessExpiresWithin(bufferMs: number): boolean {
  const expiration = localStorage.getItem(STORAGE.accessExpiration);
  if (!expiration) {
    return true;
  }
  const expMs = new Date(expiration).getTime();
  if (Number.isNaN(expMs)) {
    return true;
  }
  return expMs - Date.now() < bufferMs;
}

async function postJson(path: string, body: unknown): Promise<Response> {
  return fetch(`${DOTNET_API_BASE_URL}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    credentials: 'include',
  });
}

/**
 * Autenticação administrativa (JWT + refresh em localStorage).
 * Login/refresh usam `fetch` direto para evitar dependência circular com `adminDotnetApiClient`.
 */
export const authService: AuthServiceApi = {
  login: async (email: string, password: string) => {
    try {
      const response = await postJson('/api/Auth/login', { email, password });
      const payload = await readResponseJsonUnknown(response);

      if (!response.ok) {
        const errParsed = apiErrorBodySchema.safeParse(payload);
        const message = errParsed.success
          ? errParsed.data.message ?? AUTH_LOGIN_FAILED_CODE
          : AUTH_LOGIN_FAILED_CODE;
        throw new Error(message);
      }

      const data = parseJsonWithSchema(authTokenDtoSchema, payload);
      authService.setTokens(data);
      return data;
    } catch (error: unknown) {
      console.error('[auth] Authentication service error:', error);
      throw error;
    }
  },

  setTokens: (dto: AuthTokenDto) => {
    localStorage.setItem(STORAGE.accessToken, dto.token);
    localStorage.setItem(STORAGE.accessExpiration, dto.expiration);
    localStorage.setItem(STORAGE.refreshToken, dto.refreshToken);
    localStorage.setItem(STORAGE.refreshExpiration, dto.refreshTokenExpiration);
  },

  getAuthToken: () => localStorage.getItem(STORAGE.accessToken),

  getRefreshToken: () => localStorage.getItem(STORAGE.refreshToken),

  isAuthenticated: () => isAccessStillValid() || isRefreshStillValid(),

  logout: () => {
    clearStorage();
  },

  refreshAccessTokenFromApi: (): Promise<string | null> => {
    if (!refreshInFlight) {
      refreshInFlight = (async (): Promise<string | null> => {
        const refreshToken = localStorage.getItem(STORAGE.refreshToken);
        if (!refreshToken) {
          return null;
        }
        try {
          const response = await postJson('/api/Auth/refresh', { refreshToken });
          const payload = await readResponseJsonUnknown(response);
          if (!response.ok) {
            return null;
          }
          const data = parseJsonWithSchema(authTokenDtoSchema, payload);
          authService.setTokens(data);
          return data.token;
        } catch {
          return null;
        }
      })().finally(() => {
        refreshInFlight = null;
      });
    }
    return refreshInFlight;
  },

  ensureAccessTokenFreshIfNeeded: async (): Promise<void> => {
    if (!isRefreshStillValid()) {
      return;
    }
    const margemRenovacaoMs = 90_000;
    if (!isAccessStillValid() || accessExpiresWithin(margemRenovacaoMs)) {
      await authService.refreshAccessTokenFromApi();
    }
  },
};

export const AuthService = authService;
