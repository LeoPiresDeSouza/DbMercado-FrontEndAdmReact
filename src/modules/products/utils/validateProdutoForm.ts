import type { TFunction } from 'i18next';
import type { ProdutoFormValues } from '../types/produtoFormValues';

export function validateProdutoForm(v: ProdutoFormValues, t: TFunction): Record<string, string> {
  const e: Record<string, string> = {};

  if (!v.nome.trim()) {
    e.nome = t('modules.productsAdmin.validationNome');
  }
  if (!v.unidadeComercializacao.trim()) {
    e.unidadeComercializacao = t('modules.productsAdmin.validationUnidadeComercializacao');
  }
  if (!v.unidadeMedidaFisica.trim()) {
    e.unidadeMedidaFisica = t('modules.productsAdmin.validationUnidadeMedidaFisica');
  }
  if (!v.tipoEmbalagem.trim()) {
    e.tipoEmbalagem = t('modules.productsAdmin.validationTipoEmbalagem');
  }
  if (!v.unidadeDimensaoEmb.trim()) {
    e.unidadeDimensaoEmb = t('modules.productsAdmin.validationUnidadeDimensao');
  }
  if (!v.unidadePesoEmb.trim()) {
    e.unidadePesoEmb = t('modules.productsAdmin.validationUnidadePeso');
  }
  if (!v.ncm.trim()) {
    e.ncm = t('modules.productsAdmin.validationNcm');
  }

  const nums: Array<keyof ProdutoFormValues> = ['alturaEmb', 'larguraEmb', 'comprimentoEmb', 'pesoEmb'];
  for (const key of nums) {
    const raw = String(v[key] ?? '');
    if (raw.trim() === '' || Number.isNaN(Number(raw.replace(',', '.')))) {
      e[key] = t('modules.productsAdmin.validationNumber');
    }
  }

  if (v.incluirDimProduto) {
    if (!v.unidadeDimensaoP.trim()) {
      e.unidadeDimensaoP = t('modules.productsAdmin.validationUnidadeDimensao');
    }
    if (!v.unidadePesoP.trim()) {
      e.unidadePesoP = t('modules.productsAdmin.validationUnidadePeso');
    }
    for (const key of ['alturaP', 'larguraP', 'comprimentoP', 'pesoP'] as const) {
      const raw = v[key];
      if (raw.trim() === '' || Number.isNaN(Number(raw.replace(',', '.')))) {
        e[key] = t('modules.productsAdmin.validationNumber');
      }
    }
  }

  if (v.skus.length === 0) {
    e.skus = t('modules.productsAdmin.validationSkuMin');
  }
  v.skus.forEach((s, i) => {
    if (!s.codigo.trim()) {
      e[`skuCodigo_${i}`] = t('modules.productsAdmin.validationSkuCodigo');
    }
  });

  return e;
}
