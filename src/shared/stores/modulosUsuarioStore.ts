import { create } from 'zustand';
import type { ModuloUsuarioDto } from '../../modules/auth/types/moduloUsuario';

export interface ModulosUsuarioStoreState {
  /** `null` = ainda não carregado após autenticação; lista vazia = sem módulos ou usuário não encontrado. */
  modulos: ModuloUsuarioDto[] | null;
  setModulos: (modulos: ModuloUsuarioDto[]) => void;
  markLoadedEmpty: () => void;
  clear: () => void;
}

export const useModulosUsuarioStore = create<ModulosUsuarioStoreState>((set) => ({
  modulos: null,

  setModulos: (modulos) => {
    set({ modulos });
  },

  markLoadedEmpty: () => {
    set({ modulos: [] });
  },

  clear: () => {
    set({ modulos: null });
  },
}));
