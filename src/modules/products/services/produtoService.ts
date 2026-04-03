import { z } from 'zod';
import { adminDotnetApiClient } from '../../../integrations/dotnet-api/adminDotnetApiClient';
import { generateCorrelationId } from '../../../shared/services/http/correlationId';
import { normalizeHttpError } from '../../../shared/services/http/normalizeError';
import { deepCamelCaseKeys } from '../../../shared/utils/deepCamelCaseKeys';
import { parseJsonWithSchema } from '../../../shared/utils/parseJson';
import { readResponseJsonUnknown } from '../../../shared/utils/readJson';

const produtoResumoSchema = z.object({
  id: z.coerce.number(),
  nome: z.string(),
  unidadeComercializacao: z.string(),
  unidadeMedidaFisica: z.string(),
  tipoEmbalagem: z.string(),
  marca: z.string().nullable().optional(),
});

const listaResumoSchema = z.array(produtoResumoSchema);

const produtoGridRowSchema = z.object({
  isGroup: z.boolean(),
  groupKey: z.string().optional(),
  id: z.coerce.number().nullable().optional(),
  nome: z.string(),
  unidadeComercializacao: z.string().optional().default(''),
  unidadeMedidaFisica: z.string().optional().default(''),
  tipoEmbalagem: z.string().optional().default(''),
  marca: z.string().nullable().optional(),
  categoriaNome: z.string().nullable().optional(),
  categoriaSlug: z.string().nullable().optional(),
  childCount: z.number().optional(),
});

const produtoGridResultSchema = z.object({
  rows: z.array(produtoGridRowSchema),
  rowCount: z.number(),
});

export type ProdutoResumo = z.infer<typeof produtoResumoSchema>;

export type ProdutoGridRow = z.infer<typeof produtoGridRowSchema>;

/** Metadados SSRM: colunas de grupo / valores (alinhado a `ColumnVO`). */
export type ProdutoGridColumnVo = {
  id: string;
  displayName: string;
  field?: string | null;
  aggFunc?: string | null;
};

/** Corpo alinhado ao pedido de linhas do AG Grid (SSRM + lista plana). */
export interface ProdutoGridQueryBody {
  startRow: number;
  endRow: number;
  sortModel: Array<{ colId: string; sort?: string | null }>;
  filterModel?: Record<string, unknown> | null;
  rowGroupCols?: ProdutoGridColumnVo[];
  groupKeys?: string[];
  valueCols?: ProdutoGridColumnVo[];
  pivotMode?: boolean;
  /** Painel de facetas: categoria e subárvore no servidor. Omitir ou null = sem filtro. */
  categoriaIdFiltro?: number | null;
  /** `NACIONAL` | `IMPORTADO` (API mapeia para códigos de origem). */
  origemFiltro?: string | null;
}

const produtoSkuResponseSchema = z.object({
  id: z.coerce.number(),
  codigo: z.string(),
  ativo: z.boolean(),
});

const produtoDetalheSchema = z.object({
  id: z.coerce.number(),
  nome: z.string(),
  descricao: z.string().optional().default(''),
  marca: z.string().nullable().optional(),
  modelo: z.string().nullable().optional(),
  gtin: z.string().nullable().optional(),
  unidadeComercializacao: z.string(),
  unidadeMedidaFisica: z.string(),
  tipoEmbalagem: z.string(),
  origemGeograficaTipo: z.string(),
  origemGeograficaPais: z.string().nullable().optional(),
  dadosFiscais: z.object({
    ncm: z.string(),
    cest: z.string().nullable().optional(),
    origem: z.string(),
  }),
  dimensaoProduto: z
    .object({
      altura: z.coerce.number(),
      largura: z.coerce.number(),
      comprimento: z.coerce.number(),
      peso: z.coerce.number(),
      unidadeDimensao: z.string(),
      unidadePeso: z.string(),
    })
    .nullable()
    .optional(),
  dimensaoEmbalagem: z.object({
    altura: z.coerce.number(),
    largura: z.coerce.number(),
    comprimento: z.coerce.number(),
    peso: z.coerce.number(),
    unidadeDimensao: z.string(),
    unidadePeso: z.string(),
  }),
  skus: z.array(produtoSkuResponseSchema),
  atributos: z.array(z.object({ nome: z.string(), valor: z.string() })).optional().default([]),
});

export type ProdutoDetalhe = z.infer<typeof produtoDetalheSchema>;

/** Corpo alinhado a `ProdutoCreateDto` / `ProdutoUpdateDto` da API (camelCase). */
export interface ProdutoUpsertPayload {
  nome: string;
  descricao?: string | null;
  marca?: string | null;
  modelo?: string | null;
  gtin?: string | null;
  unidadeComercializacao: string;
  unidadeMedidaFisica: string;
  tipoEmbalagem: string;
  origemGeografica: { tipo: string; paisOrigem?: string | null };
  dadosFiscais: { ncm: string; cest?: string | null; origem: string };
  dimensaoProduto?: {
    altura: number;
    largura: number;
    comprimento: number;
    peso: number;
    unidadeDimensao: string;
    unidadePeso: string;
  } | null;
  dimensaoEmbalagem: {
    altura: number;
    largura: number;
    comprimento: number;
    peso: number;
    unidadeDimensao: string;
    unidadePeso: string;
  };
  skus: Array<{ codigo: string; ativo: boolean }>;
  atributos?: Array<{ nome: string; valor: string }> | null;
}

const produtoUnidadeMedidaOpcaoSchema = z.object({
  codigo: z.string(),
  rotulo: z.string(),
});

const listaUnidadesMedidaSchema = z.array(produtoUnidadeMedidaOpcaoSchema);

export type ProdutoUnidadeMedidaOpcao = z.infer<typeof produtoUnidadeMedidaOpcaoSchema>;

/** Listas de parâmetros para os selects do formulário de produto. */
export type ProdutoFormOpcoesCatalogo = {
  comercializacao: ProdutoUnidadeMedidaOpcao[];
  medidaFisica: ProdutoUnidadeMedidaOpcao[];
  tipoEmbalagem: ProdutoUnidadeMedidaOpcao[];
  dimensao: ProdutoUnidadeMedidaOpcao[];
  peso: ProdutoUnidadeMedidaOpcao[];
};

async function listarParametroProdutoLista(path: string): Promise<ProdutoUnidadeMedidaOpcao[]> {
  const correlationId = generateCorrelationId();
  const response = await adminDotnetApiClient.request(path, {
    method: 'GET',
    correlationId,
  });
  const raw = await readResponseJsonUnknown(response);
  if (!response.ok) {
    throw normalizeHttpError(response, 'dotnet', correlationId, raw);
  }
  return parseJsonWithSchema(listaUnidadesMedidaSchema, deepCamelCaseKeys(raw));
}

export async function listarUnidadesComercializacaoProduto(): Promise<ProdutoUnidadeMedidaOpcao[]> {
  return listarParametroProdutoLista('/api/produtos/parametros/unidades-comercializacao');
}

export async function listarUnidadesMedidaProduto(): Promise<ProdutoUnidadeMedidaOpcao[]> {
  return listarParametroProdutoLista('/api/produtos/parametros/unidades-medida');
}

export async function listarTiposEmbalagemProduto(): Promise<ProdutoUnidadeMedidaOpcao[]> {
  return listarParametroProdutoLista('/api/produtos/parametros/tipos-embalagem');
}

export async function listarUnidadesDimensaoProduto(): Promise<ProdutoUnidadeMedidaOpcao[]> {
  return listarParametroProdutoLista('/api/produtos/parametros/unidades-dimensao');
}

export async function listarUnidadesPesoProduto(): Promise<ProdutoUnidadeMedidaOpcao[]> {
  return listarParametroProdutoLista('/api/produtos/parametros/unidades-peso');
}

/** Mesmo formato de unidade de medida: código + rótulo vindos de `dbParametro` (origemGeografica). */
export async function listarOrigensGeograficasProduto(): Promise<ProdutoUnidadeMedidaOpcao[]> {
  const correlationId = generateCorrelationId();
  const response = await adminDotnetApiClient.request('/api/produtos/parametros/origens-geograficas', {
    method: 'GET',
    correlationId,
  });
  const raw = await readResponseJsonUnknown(response);
  if (!response.ok) {
    throw normalizeHttpError(response, 'dotnet', correlationId, raw);
  }
  return parseJsonWithSchema(listaUnidadesMedidaSchema, deepCamelCaseKeys(raw));
}

export async function listarProdutosResumo(): Promise<ProdutoResumo[]> {
  const correlationId = generateCorrelationId();
  const response = await adminDotnetApiClient.request('/api/produtos', { method: 'GET', correlationId });
  const raw = await readResponseJsonUnknown(response);
  if (!response.ok) {
    throw normalizeHttpError(response, 'dotnet', correlationId, raw);
  }
  return parseJsonWithSchema(listaResumoSchema, deepCamelCaseKeys(raw));
}

export async function consultarProdutosGrid(
  body: ProdutoGridQueryBody
): Promise<{ rows: ProdutoGridRow[]; rowCount: number }> {
  const correlationId = generateCorrelationId();
  const response = await adminDotnetApiClient.request('/api/produtos/consultas/grid', {
    method: 'POST',
    body: JSON.stringify({
      startRow: body.startRow,
      endRow: body.endRow,
      sortModel: body.sortModel,
      filterModel: body.filterModel ?? null,
      rowGroupCols: body.rowGroupCols ?? [],
      groupKeys: body.groupKeys ?? [],
      valueCols: body.valueCols ?? [],
      pivotMode: body.pivotMode ?? false,
      categoriaIdFiltro: body.categoriaIdFiltro ?? null,
      origemFiltro: body.origemFiltro ?? null,
    }),
    correlationId,
  });
  const raw = await readResponseJsonUnknown(response);
  if (!response.ok) {
    throw normalizeHttpError(response, 'dotnet', correlationId, raw);
  }
  return parseJsonWithSchema(produtoGridResultSchema, deepCamelCaseKeys(raw));
}

export async function obterProdutoPorId(id: number): Promise<ProdutoDetalhe> {
  const correlationId = generateCorrelationId();
  const response = await adminDotnetApiClient.request(`/api/produtos/${id}`, { method: 'GET', correlationId });
  const raw = await readResponseJsonUnknown(response);
  if (!response.ok) {
    throw normalizeHttpError(response, 'dotnet', correlationId, raw);
  }
  return parseJsonWithSchema(produtoDetalheSchema, deepCamelCaseKeys(raw));
}

export async function criarProduto(body: ProdutoUpsertPayload): Promise<number> {
  const response = await adminDotnetApiClient.request('/api/produtos', {
    method: 'POST',
    body: JSON.stringify(body),
  });
  const raw = await readResponseJsonUnknown(response);
  if (!response.ok) {
    throw new Error(
      typeof raw === 'object' && raw && 'message' in raw ? String((raw as { message?: string }).message) : `HTTP ${response.status}`
    );
  }
  if (typeof raw === 'number') {
    return raw;
  }
  if (raw !== null && typeof raw === 'object' && 'id' in raw && typeof (raw as { id: unknown }).id === 'number') {
    return (raw as { id: number }).id;
  }
  const n = Number(raw);
  if (!Number.isNaN(n)) {
    return n;
  }
  throw new Error('Resposta inesperada ao criar produto.');
}

export async function atualizarProduto(id: number, body: ProdutoUpsertPayload): Promise<void> {
  const response = await adminDotnetApiClient.request(`/api/produtos/${id}`, {
    method: 'PUT',
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    const raw = await readResponseJsonUnknown(response);
    throw new Error(
      typeof raw === 'object' && raw && 'message' in raw ? String((raw as { message?: string }).message) : `HTTP ${response.status}`
    );
  }
}

export async function excluirProduto(id: number): Promise<void> {
  const response = await adminDotnetApiClient.request(`/api/produtos/${id}`, { method: 'DELETE' });
  if (!response.ok) {
    const raw = await readResponseJsonUnknown(response);
    throw new Error(
      typeof raw === 'object' && raw && 'message' in raw ? String((raw as { message?: string }).message) : `HTTP ${response.status}`
    );
  }
}
