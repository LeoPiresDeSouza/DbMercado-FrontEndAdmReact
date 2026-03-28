/**
 * Fábrica de chaves React Query — sempre prefixar com tenant para suporte multi-tenant admin.
 * Extrair este módulo com `queryClient` para package compartilhado, se necessário.
 */
export function adminTenantScope(tenantId: string | null): string {
  return tenantId ?? 'default';
}

export const adminQueryKeys = {
  root: (tenantId: string | null) => ['admin', adminTenantScope(tenantId)] as const,

  dashboard: (tenantId: string | null) => [...adminQueryKeys.root(tenantId), 'dashboard'] as const,

  dashboardSummary: (tenantId: string | null) =>
    [...adminQueryKeys.dashboard(tenantId), 'summary'] as const,

  /** Listagens tipo grid (usuários, roles, etc.). */
  grid: (tenantId: string | null, resource: string) =>
    [...adminQueryKeys.root(tenantId), 'grid', resource] as const,

  gridList: (tenantId: string | null, resource: string, params: Record<string, unknown>) =>
    [...adminQueryKeys.grid(tenantId, resource), 'list', params] as const,
};
