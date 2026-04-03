import type { ProdutoDetalhe, ProdutoUpsertPayload } from '../services/produtoService';
import type { ProdutoFormValues } from '../types/produtoFormValues';
import { createEmptyProdutoFormValues } from '../types/produtoFormValues';

export function produtoDetalheToFormValues(p: ProdutoDetalhe): ProdutoFormValues {
  const base = createEmptyProdutoFormValues();
  return {
    ...base,
    nome: p.nome,
    descricao: p.descricao ?? '',
    marca: p.marca ?? '',
    modelo: p.modelo ?? '',
    gtin: p.gtin ?? '',
    unidadeComercializacao: p.unidadeComercializacao,
    unidadeMedidaFisica: p.unidadeMedidaFisica,
    tipoEmbalagem: p.tipoEmbalagem,
    origemTipo: p.origemGeograficaTipo,
    paisOrigem: p.origemGeograficaPais ?? '',
    ncm: p.dadosFiscais.ncm,
    cest: p.dadosFiscais.cest ?? '',
    origemIcms: p.dadosFiscais.origem,
    alturaEmb: String(p.dimensaoEmbalagem.altura),
    larguraEmb: String(p.dimensaoEmbalagem.largura),
    comprimentoEmb: String(p.dimensaoEmbalagem.comprimento),
    pesoEmb: String(p.dimensaoEmbalagem.peso),
    unidadeDimensaoEmb: p.dimensaoEmbalagem.unidadeDimensao,
    unidadePesoEmb: p.dimensaoEmbalagem.unidadePeso,
    incluirDimProduto: p.dimensaoProduto != null,
    alturaP: p.dimensaoProduto ? String(p.dimensaoProduto.altura) : '0',
    larguraP: p.dimensaoProduto ? String(p.dimensaoProduto.largura) : '0',
    comprimentoP: p.dimensaoProduto ? String(p.dimensaoProduto.comprimento) : '0',
    pesoP: p.dimensaoProduto ? String(p.dimensaoProduto.peso) : '0',
    unidadeDimensaoP: p.dimensaoProduto?.unidadeDimensao ?? base.unidadeDimensaoP,
    unidadePesoP: p.dimensaoProduto?.unidadePeso ?? base.unidadePesoP,
    skus: p.skus.map((s) => ({ codigo: s.codigo, ativo: s.ativo })),
  };
}

function parseDecimal(s: string): number {
  return Number(s.replace(',', '.'));
}

export function produtoFormValuesToUpsert(v: ProdutoFormValues): ProdutoUpsertPayload {
  const emb = {
    altura: parseDecimal(v.alturaEmb),
    largura: parseDecimal(v.larguraEmb),
    comprimento: parseDecimal(v.comprimentoEmb),
    peso: parseDecimal(v.pesoEmb),
    unidadeDimensao: v.unidadeDimensaoEmb.trim(),
    unidadePeso: v.unidadePesoEmb.trim(),
  };
  const payload: ProdutoUpsertPayload = {
    nome: v.nome.trim(),
    descricao: v.descricao.trim() || null,
    marca: v.marca.trim() || null,
    modelo: v.modelo.trim() || null,
    gtin: v.gtin.trim() || null,
    unidadeComercializacao: v.unidadeComercializacao.trim(),
    unidadeMedidaFisica: v.unidadeMedidaFisica.trim(),
    tipoEmbalagem: v.tipoEmbalagem.trim(),
    origemGeografica: {
      tipo: v.origemTipo.trim(),
      paisOrigem: v.paisOrigem.trim() || null,
    },
    dadosFiscais: {
      ncm: v.ncm.trim(),
      cest: v.cest.trim() || null,
      origem: v.origemIcms.trim(),
    },
    dimensaoEmbalagem: emb,
    skus: v.skus.map((s) => ({ codigo: s.codigo.trim(), ativo: s.ativo })),
  };
  if (v.incluirDimProduto) {
    payload.dimensaoProduto = {
      altura: parseDecimal(v.alturaP),
      largura: parseDecimal(v.larguraP),
      comprimento: parseDecimal(v.comprimentoP),
      peso: parseDecimal(v.pesoP),
      unidadeDimensao: v.unidadeDimensaoP.trim(),
      unidadePeso: v.unidadePesoP.trim(),
    };
  } else {
    payload.dimensaoProduto = null;
  }
  return payload;
}
