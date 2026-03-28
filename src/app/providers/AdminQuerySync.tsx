import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { invalidateAdminDataCache } from '../../shared/query/invalidateAdminCache';
import { useAuthStore } from '../../shared/stores/authStore';
import { usePermissionStore } from '../../shared/stores/permissionStore';

const TENANT_STORAGE_KEY = 'admin_tenant_id';

/**
 * Sincroniza invalidação de cache React Query com tenant, sessão e revisão de permissões.
 */
export function AdminQuerySync(): null {
  const queryClient = useQueryClient();
  const tenantId = useAuthStore((s) => s.tenantId);
  const sessionRevision = useAuthStore((s) => s.sessionRevision);
  const permissionRevision = usePermissionStore((s) => s.revision);
  const hydrateAuth = useAuthStore((s) => s.hydrate);

  useEffect(() => {
    hydrateAuth();
  }, [hydrateAuth]);

  useEffect(() => {
    const onStorage = (e: StorageEvent): void => {
      if (e.key === TENANT_STORAGE_KEY) {
        useAuthStore.setState({ tenantId: e.newValue });
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  useEffect(() => {
    invalidateAdminDataCache(queryClient, tenantId);
  }, [queryClient, tenantId, sessionRevision, permissionRevision]);

  return null;
}
