import { create } from 'zustand';

const TENANT_STORAGE_KEY = 'admin_tenant_id';

function readTenantFromStorage(): string | null {
  if (typeof window === 'undefined') {
    return null;
  }
  return localStorage.getItem(TENANT_STORAGE_KEY);
}

export interface AuthStoreState {
  /**
   * Escopo multi-tenant do painel (org/workspace). `null` = tenant padrão da instalação.
   * Persistido em `localStorage` (`admin_tenant_id`).
   */
  tenantId: string | null;
  /**
   * Incrementado após login bem-sucedido ou troca de tenant — invalida caches escopados.
   */
  sessionRevision: number;
  /** Sessão de app hidratada (storage lido). */
  hydrated: boolean;
  hydrate: () => void;
  /** Chamar após `authService.login` / refresh que mantém o usuário logado. */
  afterSuccessfulAuth: () => void;
  setTenantId: (tenantId: string | null) => void;
  /** Logout / falha global de auth: limpa escopo tenant em memória e storage. */
  clearSession: () => void;
}

export const useAuthStore = create<AuthStoreState>((set) => ({
  tenantId: readTenantFromStorage(),
  sessionRevision: 0,
  hydrated: typeof window !== 'undefined',

  hydrate: () => {
    set({ tenantId: readTenantFromStorage(), hydrated: true });
  },

  afterSuccessfulAuth: () => {
    set((s) => ({ sessionRevision: s.sessionRevision + 1 }));
  },

  setTenantId: (tenantId) => {
    if (typeof window !== 'undefined') {
      if (tenantId) {
        localStorage.setItem(TENANT_STORAGE_KEY, tenantId);
      } else {
        localStorage.removeItem(TENANT_STORAGE_KEY);
      }
    }
    set((s) => ({ tenantId, sessionRevision: s.sessionRevision + 1 }));
  },

  clearSession: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(TENANT_STORAGE_KEY);
    }
    set({ tenantId: null, sessionRevision: 0, hydrated: true });
  },
}));
