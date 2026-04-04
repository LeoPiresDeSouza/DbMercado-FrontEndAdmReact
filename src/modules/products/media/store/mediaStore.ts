import { create } from 'zustand';
import type { MediaItem } from '../types/midiaTypes';

interface MediaStore {
  itens: MediaItem[];
  adicionarItens: (novos: MediaItem[]) => void;
  atualizarItem: (id: string, patch: Partial<MediaItem>) => void;
  removerItem: (id: string) => void;
  substituirItens: (itens: MediaItem[]) => void;
  reordenar: (itensReordenados: MediaItem[]) => void;
  definirPrincipal: (id: string) => void;
  limparTudo: () => void;
}

function revogarPreviewSeNecessario(item: MediaItem): void {
  if (item.previewUrl.startsWith('blob:')) {
    try {
      URL.revokeObjectURL(item.previewUrl);
    } catch {
      /* ignore */
    }
  }
}

export const useMediaStore = create<MediaStore>((set, get) => ({
  itens: [],

  adicionarItens: (novos) =>
    set((s) => ({
      itens: [...s.itens, ...novos].map((it, i) => ({ ...it, ordem: i })),
    })),

  atualizarItem: (id, patch) =>
    set((s) => ({
      itens: s.itens.map((it) => (it.id === id ? { ...it, ...patch } : it)),
    })),

  removerItem: (id) =>
    set((s) => {
      const alvo = s.itens.find((x) => x.id === id);
      if (alvo) revogarPreviewSeNecessario(alvo);
      const filtrados = s.itens.filter((x) => x.id !== id);
      return { itens: filtrados.map((it, i) => ({ ...it, ordem: i })) };
    }),

  substituirItens: (itens) => set({ itens: itens.map((it, i) => ({ ...it, ordem: i })) }),

  reordenar: (itensReordenados) =>
    set({
      itens: itensReordenados.map((it, i) => ({ ...it, ordem: i })),
    }),

  definirPrincipal: (id) =>
    set((s) => {
      const alvo = s.itens.find((x) => x.id === id);
      if (!alvo || alvo.tipo !== 'imagem') return s;
      return {
        itens: s.itens.map((it) =>
          it.id === id ? { ...it, isPrincipal: true } : { ...it, isPrincipal: false }
        ),
      };
    }),

  limparTudo: () => {
    const { itens } = get();
    itens.forEach(revogarPreviewSeNecessario);
    set({ itens: [] });
  },
}));
