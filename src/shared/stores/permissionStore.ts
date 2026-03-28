import { create } from 'zustand';
import type { PermissionDto } from '../types';

export interface PermissionStoreState {
  /** Permissões efetivas do usuário (claims) — preencher via API quando existir endpoint. */
  permissions: PermissionDto[];
  /**
   * Revisão monotônica: incremente após qualquer alteração de roles/claims no servidor
   * para disparar invalidação de cache (via `AdminQuerySync`).
   */
  revision: number;
  setPermissions: (permissions: PermissionDto[]) => void;
  upsertPermission: (permission: PermissionDto) => void;
  removePermission: (id: string) => void;
  clear: () => void;
  bumpRevision: () => void;
}

export const usePermissionStore = create<PermissionStoreState>((set) => ({
  permissions: [],
  revision: 0,

  setPermissions: (permissions) => {
    set((s) => ({ permissions, revision: s.revision + 1 }));
  },

  upsertPermission: (permission) => {
    set((s) => {
      const others = s.permissions.filter((p) => p.id !== permission.id);
      return { permissions: [...others, permission], revision: s.revision + 1 };
    });
  },

  removePermission: (id) => {
    set((s) => ({
      permissions: s.permissions.filter((p) => p.id !== id),
      revision: s.revision + 1,
    }));
  },

  clear: () => {
    set({ permissions: [], revision: 0 });
  },

  bumpRevision: () => {
    set((s) => ({ revision: s.revision + 1 }));
  },
}));

/** Chame após mutações de perfil/permissão no backend (ex.: salvar role). */
export function notifyPermissionsChanged(): void {
  usePermissionStore.getState().bumpRevision();
}
