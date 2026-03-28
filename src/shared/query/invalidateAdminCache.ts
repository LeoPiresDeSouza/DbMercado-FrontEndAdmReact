import type { QueryClient } from '@tanstack/react-query';
import { adminQueryKeys } from './queryKeys';

/** Invalida dashboard, grids e demais queries sob o prefixo do tenant atual. */
export function invalidateAdminDataCache(queryClient: QueryClient, tenantId: string | null): void {
  void queryClient.invalidateQueries({ queryKey: adminQueryKeys.root(tenantId) });
}
