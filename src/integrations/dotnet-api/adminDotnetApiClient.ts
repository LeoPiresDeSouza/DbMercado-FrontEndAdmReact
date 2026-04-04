import { createApiClient, type HttpTokenProvider } from '../../shared/services/http';
import { performClientLogoutCleanup } from '../../shared/auth/clientSessionCleanup';
import { authService } from '../../modules/auth/services/authService';
import { DOTNET_API_BASE_URL } from './config';

const dotnetTokenProvider: HttpTokenProvider = {
  getAccessToken: () => authService.getAuthToken(),
  refreshAccessToken: () => authService.refreshAccessTokenFromApi(),
  prepareAuthenticatedRequest: () => authService.ensureAccessTokenFreshIfNeeded(),
  onAuthFailure: () => {
    performClientLogoutCleanup();
    window.location.assign('/login');
  },
};

/**
 * Cliente HTTP para a API .NET (Bearer + refresh + telemetria).
 * Uso em serviços de módulos (users, roles, etc.).
 */
export const adminDotnetApiClient = createApiClient({
  baseUrl: DOTNET_API_BASE_URL,
  backendId: 'dotnet',
  tokenProvider: dotnetTokenProvider,
  publicPathPrefixes: ['/api/Auth/login', '/api/Auth/refresh'],
});
