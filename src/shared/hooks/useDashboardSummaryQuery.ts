import { useQuery } from '@tanstack/react-query';
import { authService } from '../../modules/auth/services/authService';
import { adminQueryKeys } from '../query/queryKeys';
import { useAuthStore } from '../stores/authStore';

export interface DashboardSummaryDto {
  updatedAt: string;
  tenantScope: string | null;
}

/**
 * Cache do resumo do dashboard (substituir `queryFn` por chamada real à API .NET quando existir).
 */
export function useDashboardSummaryQuery(): ReturnType<
  typeof useQuery<DashboardSummaryDto, Error>
> {
  const tenantId = useAuthStore((s) => s.tenantId);

  return useQuery({
    queryKey: adminQueryKeys.dashboardSummary(tenantId),
    queryFn: async (): Promise<DashboardSummaryDto> => {
      await new Promise((r) => {
        setTimeout(r, 120);
      });
      return {
        updatedAt: new Date().toISOString(),
        tenantScope: tenantId,
      };
    },
    staleTime: 60_000,
    enabled: authService.isAuthenticated(),
  });
}
