export interface CategoriaTreeNode {
  id: number;
  nome: string;
  slug: string;
  descricao: string | null;
  categoriaPaiId: number | null;
  nivel: number;
  ativo: boolean;
  subcategorias: CategoriaTreeNode[];
}

export interface ProdutoFiltrosAtivos {
  categoriaId: number | null;
  categoriaNome: string | null;
  categoriaCaminho: string[];
  /** `NACIONAL` | `IMPORTADO` — alinhado ao filtro da API. */
  origem: string | null;
}

export const FILTROS_ATIVOS_VAZIO: ProdutoFiltrosAtivos = {
  categoriaId: null,
  categoriaNome: null,
  categoriaCaminho: [],
  origem: null,
};
