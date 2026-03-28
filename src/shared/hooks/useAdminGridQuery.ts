import { useQuery } from '@tanstack/react-query';
import { authService } from '../../modules/auth/services/authService';
import { adminQueryKeys } from '../query/queryKeys';
import { useAuthStore } from '../stores/authStore';

export interface AdminGridResult<T> {
  items: T[];
  totalCount: number;
}

interface UseAdminGridQueryOptions {
  enabled?: boolean;
}

/**
 * Padrão de cache para grids administrativos (lista paginada / filtros).
 * `queryFn` deve ser trocada por `adminDotnetApiClient.requestJson` quando os endpoints existirem.
 */
export function useAdminGridQuery<T = Record<string, unknown>>(
  resource: string,
  params: Record<string, unknown>,
  options: UseAdminGridQueryOptions = {}
): ReturnType<typeof useQuery<AdminGridResult<T>, Error>> {
  const tenantId = useAuthStore((s) => s.tenantId);

  return useQuery({
    queryKey: adminQueryKeys.gridList(tenantId, resource, params),
    queryFn: async (): Promise<AdminGridResult<T>> => {
      await new Promise((r) => {
        setTimeout(r, 100);
      });
      return { items: [], totalCount: 0 };
    },
    staleTime: 30_000,
    enabled: options.enabled ?? authService.isAuthenticated(),
  });
}
