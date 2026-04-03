import type { ColDef, ICellRendererParams, IAggFuncParams } from 'ag-grid-community';
import type { ProdutoGridRow } from '../services/produtoService';
import { ProdutoAcoesCell } from './ProdutoAcoesCell';

/** Contagem devolvida pelo servidor nas linhas de grupo (`id` ou `childCount`). */
function ssrmContagemNoGrupo(data: ProdutoGridRow | null | undefined): number | null {
  if (data == null || data.isGroup !== true) {
    return null;
  }
  if (typeof data.id === 'number' && !Number.isNaN(data.id)) {
    return data.id;
  }
  if (data.id != null) {
    const n = Number(data.id);
    if (!Number.isNaN(n)) {
      return n;
    }
  }
  const cc = data.childCount;
  if (typeof cc === 'number' && !Number.isNaN(cc)) {
    return cc;
  }
  return null;
}

/**
 * SSRM + Valores: o valor agregado nem sempre chega a `params.value` em linhas de grupo; o total
 * fica no servidor em `data.id` / {@link ProdutoGridRow.childCount}.
 */
function produtoGridSsrmCountCell(p: ICellRendererParams<ProdutoGridRow>): string {
  if (p.node?.footer === true) {
    const v = p.value;
    return v != null && v !== '' ? String(v) : '—';
  }
  const servidor = ssrmContagemNoGrupo(p.data);
  if (servidor != null) {
    return String(servidor);
  }
  const v = p.value;
  if (v != null && v !== '') {
    return String(v);
  }
  return '—';
}

/**
 * SSRM: grupos costumam ter `params.values` vazio até expandir; o count nativo somava 0.
 * Não exigir `rowNode.group` — em SSRM pode não bater com `data.isGroup` na passagem da agg.
 * Usar como `aggFuncs.count` no grid para todas as colunas em Valores.
 */
export function produtoGridSsrmCountAgg(params: IAggFuncParams<ProdutoGridRow, number | null>): number | null {
  const { rowNode, data } = params;

  if (rowNode.footer === true) {
    let n = 0;
    for (const v of params.values) {
      if (v != null) {
        n++;
      }
    }
    return n;
  }

  const doServidor = ssrmContagemNoGrupo(data);
  if (doServidor != null) {
    return doServidor;
  }

  // Folha de produto: colunas de contagem não exibem o campo bruto (evita "UN"/texto duplicado).
  if (data != null && data.isGroup !== true) {
    return null;
  }

  let n = 0;
  for (const v of params.values) {
    if (v != null) {
      n++;
    }
  }
  return n;
}

const COL_MARCA = 'marca';
const COL_UNIDADE = 'unidadeMedida';

/** Colunas sem `field`: só para arrastar a Valores; não duplicam dados nem competem com `pinned`/flex das colunas do catálogo. */
export const PRODUTO_GRID_COL_ID = 'id' as const;
export const PRODUTO_GRID_SSRM_COUNT_NOME = 'ssrmCount_nome' as const;
export const PRODUTO_GRID_SSRM_COUNT_MARCA = 'ssrmCount_marca' as const;
export const PRODUTO_GRID_SSRM_COUNT_UNIDADE = 'ssrmCount_unidadeMedida' as const;

const SSRM_COUNT_NOME = PRODUTO_GRID_SSRM_COUNT_NOME;
const SSRM_COUNT_MARCA = PRODUTO_GRID_SSRM_COUNT_MARCA;
const SSRM_COUNT_UNIDADE = PRODUTO_GRID_SSRM_COUNT_UNIDADE;

export type ProdutoGridColDefLabels = {
  nome: string;
  marca: string;
  categoria: string;
  unidade: string;
  acoes: string;
  countNome: string;
  countMarca: string;
  countUnidade: string;
};

/**
 * Catálogo ERP: sem `flex` nas colunas — combinamos com `gridOptions.autoSizeStrategy` tipo `fitGridWidth`
 * (ver ProdutosGrid); na v33+ do AG Grid, `flex` + `autoSizeStrategy` são incompatíveis e o grid não estica.
 */
export function createProdutoGridColumnDefs(labels: ProdutoGridColDefLabels): ColDef<ProdutoGridRow>[] {
  const dash = (v: unknown) => (v == null || v === '' ? '—' : String(v));

  return [
    {
      colId: PRODUTO_GRID_COL_ID,
      field: 'id',
      headerName: 'ID',
      width: 88,
      hide: true,
      lockVisible: true,
      editable: false,
      filter: 'agNumberColumnFilter',
      floatingFilter: false,
      type: 'rightAligned',
      enablePivot: false,
      enableRowGroup: false,
      enableValue: false,
      suppressColumnsToolPanel: true,
      suppressFiltersToolPanel: true,
    },
    {
      colId: 'nome',
      field: 'nome',
      headerName: labels.nome,
      width: 320,
      minWidth: 220,
      editable: false,
      filter: 'agTextColumnFilter',
      floatingFilter: false,
      enableRowGroup: true,
      enableValue: false,
      enablePivot: false,
    },
    {
      colId: COL_MARCA,
      field: 'marca',
      headerName: labels.marca,
      width: 220,
      minWidth: 200,
      editable: false,
      filter: 'agTextColumnFilter',
      floatingFilter: false,
      valueFormatter: (p) => dash(p.value),
      enableRowGroup: true,
      enableValue: false,
      enablePivot: false,
    },
    {
      colId: 'categoriaNome',
      field: 'categoriaNome',
      headerName: labels.categoria,
      width: 200,
      minWidth: 160,
      editable: false,
      filter: false,
      floatingFilter: false,
      sortable: true,
      valueFormatter: (p) => dash(p.value),
      enableRowGroup: false,
      enableValue: false,
      enablePivot: false,
    },
    {
      colId: COL_UNIDADE,
      field: 'unidadeMedidaFisica',
      headerName: labels.unidade,
      width: 120,
      minWidth: 96,
      editable: false,
      filter: 'agTextColumnFilter',
      floatingFilter: false,
      type: 'rightAligned',
      cellClass: 'produtos-grid__cell--numeric',
      enableRowGroup: true,
      enableValue: false,
      enablePivot: false,
    },
    {
      colId: SSRM_COUNT_NOME,
      headerName: labels.countNome,
      width: 120,
      minWidth: 96,
      maxWidth: 200,
      hide: true,
      editable: false,
      sortable: false,
      filter: false,
      floatingFilter: false,
      type: 'rightAligned',
      cellClass: 'produtos-grid__cell--numeric',
      cellRenderer: produtoGridSsrmCountCell,
      enableRowGroup: false,
      enableValue: true,
      allowedAggFuncs: ['count'],
      defaultAggFunc: 'count',
      enablePivot: false,
      suppressColumnsToolPanel: false,
      suppressFiltersToolPanel: true,
    },
    {
      colId: SSRM_COUNT_MARCA,
      headerName: labels.countMarca,
      width: 120,
      minWidth: 96,
      maxWidth: 200,
      hide: true,
      editable: false,
      sortable: false,
      filter: false,
      floatingFilter: false,
      type: 'rightAligned',
      cellClass: 'produtos-grid__cell--numeric',
      cellRenderer: produtoGridSsrmCountCell,
      enableRowGroup: false,
      enableValue: true,
      allowedAggFuncs: ['count'],
      defaultAggFunc: 'count',
      enablePivot: false,
      suppressColumnsToolPanel: false,
      suppressFiltersToolPanel: true,
    },
    {
      colId: SSRM_COUNT_UNIDADE,
      headerName: labels.countUnidade,
      width: 120,
      minWidth: 96,
      maxWidth: 200,
      hide: true,
      editable: false,
      sortable: false,
      filter: false,
      floatingFilter: false,
      type: 'rightAligned',
      cellClass: 'produtos-grid__cell--numeric',
      cellRenderer: produtoGridSsrmCountCell,
      enableRowGroup: false,
      enableValue: true,
      allowedAggFuncs: ['count'],
      defaultAggFunc: 'count',
      enablePivot: false,
      suppressColumnsToolPanel: false,
      suppressFiltersToolPanel: true,
    },
    {
      colId: 'acoes',
      headerName: labels.acoes,
      width: 90,
      minWidth: 84,
      maxWidth: 104,
      suppressSizeToFit: true,
      pinned: 'right',
      sortable: false,
      filter: false,
      floatingFilter: false,
      suppressMovable: true,
      enableRowGroup: false,
      enableValue: false,
      enablePivot: false,
      cellClass: 'produtos-grid__cell--acoes',
      cellRenderer: ProdutoAcoesCell,
    },
  ];
}
