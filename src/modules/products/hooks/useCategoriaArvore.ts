import { useQuery } from '@tanstack/react-query';
import { listarArvoreCategoriasProduto } from '../services/categoriaService';
import type { CategoriaTreeNode } from '../types/categoriaTypes';

export function useCategoriaArvore() {
  return useQuery({
    queryKey: ['categorias-produto-arvore'],
    queryFn: listarArvoreCategoriasProduto,
    staleTime: 5 * 60 * 1000,
  });
}

/** Dado um id, devolve o caminho completo de nomes da raiz até o nó (ex.: ["Alimentos", "Grãos e Cereais"]). */
export function resolverCaminho(arvore: CategoriaTreeNode[], categoriaId: number): string[] {
  const caminhoInverso: string[] = [];

  function buscar(nos: CategoriaTreeNode[], id: number): boolean {
    for (const no of nos) {
      if (no.id === id) {
        caminhoInverso.push(no.nome);
        return true;
      }
      if (buscar(no.subcategorias, id)) {
        caminhoInverso.push(no.nome);
        return true;
      }
    }
    return false;
  }

  buscar(arvore, categoriaId);
  return caminhoInverso.reverse();
}
