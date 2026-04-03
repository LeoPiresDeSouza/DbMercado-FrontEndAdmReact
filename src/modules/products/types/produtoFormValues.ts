/** Estado editável do formulário de produto (espelha o payload da API em formato de string para inputs). */
export interface ProdutoFormValues {
  nome: string;
  descricao: string;
  marca: string;
  modelo: string;
  gtin: string;
  unidadeComercializacao: string;
  unidadeMedidaFisica: string;
  tipoEmbalagem: string;
  origemTipo: string;
  paisOrigem: string;
  ncm: string;
  cest: string;
  origemIcms: string;
  alturaEmb: string;
  larguraEmb: string;
  comprimentoEmb: string;
  pesoEmb: string;
  unidadeDimensaoEmb: string;
  unidadePesoEmb: string;
  incluirDimProduto: boolean;
  alturaP: string;
  larguraP: string;
  comprimentoP: string;
  pesoP: string;
  unidadeDimensaoP: string;
  unidadePesoP: string;
  skus: Array<{ codigo: string; ativo: boolean }>;
}

export function createEmptyProdutoFormValues(): ProdutoFormValues {
  return {
    nome: '',
    descricao: '',
    marca: '',
    modelo: '',
    gtin: '',
    unidadeComercializacao: 'UN',
    unidadeMedidaFisica: 'UN',
    tipoEmbalagem: 'CX',
    origemTipo: '1',
    paisOrigem: '',
    ncm: '',
    cest: '',
    origemIcms: '0',
    alturaEmb: '1',
    larguraEmb: '1',
    comprimentoEmb: '1',
    pesoEmb: '1',
    unidadeDimensaoEmb: 'CM',
    unidadePesoEmb: 'KG',
    incluirDimProduto: false,
    alturaP: '0',
    larguraP: '0',
    comprimentoP: '0',
    pesoP: '1',
    unidadeDimensaoP: 'CM',
    unidadePesoP: 'KG',
    skus: [{ codigo: 'PADRAO', ativo: true }],
  };
}
