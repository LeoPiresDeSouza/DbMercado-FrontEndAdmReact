import { createApiClient, type HttpTokenProvider } from '../../shared/services/http';
import { authService } from '../../modules/auth/services/authService';
import { queryClient } from '../../shared/query/queryClient';
import { useAuthStore } from '../../shared/stores/authStore';
import { useNotificationCenterStore } from '../../shared/stores/notificationCenterStore';
import { useModulosUsuarioStore } from '../../shared/stores/modulosUsuarioStore';
import { usePermissionStore } from '../../shared/stores/permissionStore';
import { DOTNET_API_BASE_URL } from './config';

const dotnetTokenProvider: HttpTokenProvider = {
  getAccessToken: () => authService.getAuthToken(),
  refreshAccessToken: () => authService.refreshAccessTokenFromApi(),
  onAuthFailure: () => {
    authService.logout();
    useAuthStore.getState().clearSession();
    usePermissionStore.getState().clear();
    useModulosUsuarioStore.getState().clear();
    useNotificationCenterStore.getState().clear();
    queryClient.clear();
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
