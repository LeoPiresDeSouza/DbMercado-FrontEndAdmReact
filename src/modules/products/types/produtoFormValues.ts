/** Estado editável do formulário de produto (espelha o payload da API em formato de string para inputs). */
export interface ProdutoFormValues {
  nome: string;
  descricao: string;
  marca: string;
  modelo: string;
  gtin: string;
  unidadeMedida: string;
  origemTipo: string;
  paisOrigem: string;
  ncm: string;
  cest: string;
  origemIcms: string;
  alturaEmb: string;
  larguraEmb: string;
  comprimentoEmb: string;
  pesoEmb: string;
  incluirDimProduto: boolean;
  alturaP: string;
  larguraP: string;
  comprimentoP: string;
  skus: Array<{ codigo: string; ativo: boolean }>;
}

export function createEmptyProdutoFormValues(): ProdutoFormValues {
  return {
    nome: '',
    descricao: '',
    marca: '',
    modelo: '',
    gtin: '',
    unidadeMedida: 'UN',
    origemTipo: 'NACIONAL',
    paisOrigem: '',
    ncm: '',
    cest: '',
    origemIcms: '0',
    alturaEmb: '1',
    larguraEmb: '1',
    comprimentoEmb: '1',
    pesoEmb: '1',
    incluirDimProduto: false,
    alturaP: '0',
    larguraP: '0',
    comprimentoP: '0',
    skus: [{ codigo: 'PADRAO', ativo: true }],
  };
}
