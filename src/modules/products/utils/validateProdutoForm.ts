import type { TFunction } from 'i18next';
import { ORIGEM_GEOGRAFICA_IMPORTADO } from '../constants/origemGeografica';
import type { ProdutoFormValues } from '../types/produtoFormValues';
import { somenteDigitosAscii } from './fiscalDigitos';
import { parseDecimalDoFormulario } from './produtoFormParse';

const MAX_NOME = 256;
const MAX_DESCRICAO = 2000;
const MAX_MARCA_MODELO = 128;
const MAX_PAIS = 128;
const GTIN_MAX = 32;
const ORIGEM_ICMS_MAX_DIGITS = 8;

function validarGtinOpcional(gtin: string, t: TFunction): string | undefined {
  const s = gtin.trim();
  if (!s) {
    return undefined;
  }
  if (s.length > GTIN_MAX) {
    return t('modules.productsAdmin.validationGtinMax', { max: GTIN_MAX });
  }
  if (/^\d+$/.test(s) && (s.length < 8 || s.length > 14)) {
    return t('modules.productsAdmin.validationGtinTamanho');
  }
  return undefined;
}

function erroDimPositiva(raw: string, t: TFunction): string | undefined {
  const n = parseDecimalDoFormulario(raw);
  if (n === null) {
    return t('modules.productsAdmin.validationNumber');
  }
  if (n <= 0) {
    return t('modules.productsAdmin.validationPositiveNumber');
  }
  return undefined;
}

export function validateProdutoForm(v: ProdutoFormValues, t: TFunction): Record<string, string> {
  const e: Record<string, string> = {};

  const nomeT = v.nome.trim();
  if (!nomeT) {
    e.nome = t('modules.productsAdmin.validationNome');
  } else if (nomeT.length > MAX_NOME) {
    e.nome = t('modules.productsAdmin.validationMaxLength', { max: MAX_NOME });
  }

  if (v.categoriaProdutoId === null) {
    e.categoriaProdutoId = t('modules.productsAdmin.validationCategoria');
  }

  const descT = v.descricao.trim();
  if (descT.length > MAX_DESCRICAO) {
    e.descricao = t('modules.productsAdmin.validationMaxLength', { max: MAX_DESCRICAO });
  }

  const marcaT = v.marca.trim();
  if (marcaT.length > MAX_MARCA_MODELO) {
    e.marca = t('modules.productsAdmin.validationMaxLength', { max: MAX_MARCA_MODELO });
  }

  const modeloT = v.modelo.trim();
  if (modeloT.length > MAX_MARCA_MODELO) {
    e.modelo = t('modules.productsAdmin.validationMaxLength', { max: MAX_MARCA_MODELO });
  }

  const gtinErr = validarGtinOpcional(v.gtin, t);
  if (gtinErr) {
    e.gtin = gtinErr;
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

  const origemT = v.origemTipo.trim().toUpperCase();
  if (!origemT) {
    e.origemTipo = t('modules.productsAdmin.validationOrigemTipo');
  }

  const paisT = v.paisOrigem.trim();
  if (paisT.length > MAX_PAIS) {
    e.paisOrigem = t('modules.productsAdmin.validationMaxLength', { max: MAX_PAIS });
  } else if (origemT === ORIGEM_GEOGRAFICA_IMPORTADO && !paisT) {
    e.paisOrigem = t('modules.productsAdmin.validationPaisOrigemImportado');
  }

  const ncmDigitos = somenteDigitosAscii(v.ncm);
  if (!v.ncm.trim()) {
    e.ncm = t('modules.productsAdmin.validationNcm');
  } else if (ncmDigitos.length !== 8) {
    e.ncm = t('modules.productsAdmin.validationNcmOitoDigitos', { count: ncmDigitos.length });
  }

  if (v.cest.trim()) {
    const cestD = somenteDigitosAscii(v.cest);
    if (cestD.length !== 7) {
      e.cest = t('modules.productsAdmin.validationCestSeteDigitos', { count: cestD.length });
    }
  }

  const oIcms = v.origemIcms.trim();
  if (!oIcms) {
    e.origemIcms = t('modules.productsAdmin.validationOrigemIcmsObrigatoria');
  } else if (oIcms.length > ORIGEM_ICMS_MAX_DIGITS || !/^\d+$/.test(oIcms)) {
    e.origemIcms = t('modules.productsAdmin.validationOrigemIcmsFormato', { max: ORIGEM_ICMS_MAX_DIGITS });
  }

  const numsEmb: Array<keyof ProdutoFormValues> = ['alturaEmb', 'larguraEmb', 'comprimentoEmb', 'pesoEmb'];
  for (const key of numsEmb) {
    const msg = erroDimPositiva(String(v[key] ?? ''), t);
    if (msg) {
      e[key] = msg;
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
      const msg = erroDimPositiva(v[key], t);
      if (msg) {
        e[key] = msg;
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

  const codigosNorm = v.skus.map((s) => s.codigo.trim()).filter((c) => c.length > 0);
  const contagens = new Map<string, number>();
  codigosNorm.forEach((c) => {
    const k = c.toLowerCase();
    contagens.set(k, (contagens.get(k) ?? 0) + 1);
  });
  v.skus.forEach((s, i) => {
    const c = s.codigo.trim();
    if (!c) {
      return;
    }
    if ((contagens.get(c.toLowerCase()) ?? 0) > 1) {
      e[`skuCodigo_${i}`] = t('modules.productsAdmin.validationSkuDuplicado', { codigo: c });
    }
  });

  return e;
}
