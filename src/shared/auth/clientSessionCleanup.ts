import { authService } from '../../modules/auth/services/authService';
import { queryClient } from '../query/queryClient';
import { useAuthStore } from '../stores/authStore';
import { useModulosUsuarioStore } from '../stores/modulosUsuarioStore';
import { useNotificationCenterStore } from '../stores/notificationCenterStore';
import { usePermissionStore } from '../stores/permissionStore';

/**
 * Remove tokens e estado derivado (permissões, React Query, etc.).
 * Usado após 401+refresh falho, validação de sessão no servidor ou logout explícito.
 */
export function performClientLogoutCleanup(): void {
  authService.logout();
  useAuthStore.getState().clearSession();
  usePermissionStore.getState().clear();
  useModulosUsuarioStore.getState().clear();
  useNotificationCenterStore.getState().clear();
  queryClient.clear();
}
