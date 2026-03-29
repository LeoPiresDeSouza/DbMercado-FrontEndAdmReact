import type { ColDef } from 'ag-grid-community';
import type { ProdutoResumo } from '../services/produtoService';
import { ProdutoAcoesCell } from './ProdutoAcoesCell';

const COL_MARCA = 'marca';
const COL_UNIDADE = 'unidadeMedida';

export type ProdutoGridColDefLabels = {
  nome: string;
  marca: string;
  unidade: string;
  acoes: string;
};

/**
 * Colunas alinhadas ao catálogo ERP: larguras fixas + uma coluna `flex` (marca).
 * Dados limitados ao contrato atual da API (`ProdutoResumo`: nome, marca, unidadeMedida).
 */
export function createProdutoGridColumnDefs(labels: ProdutoGridColDefLabels): ColDef<ProdutoResumo>[] {
  const dash = (v: unknown) => (v == null || v === '' ? '—' : String(v));

  return [
    {
      colId: 'id',
      field: 'id',
      headerName: 'ID',
      width: 88,
      hide: true,
      editable: false,
      filter: 'agNumberColumnFilter',
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
      width: 260,
      minWidth: 220,
      maxWidth: 560,
      editable: false,
      filter: 'agTextColumnFilter',
    },
    {
      colId: COL_MARCA,
      field: 'marca',
      headerName: labels.marca,
      flex: 1,
      minWidth: 200,
      editable: false,
      filter: 'agTextColumnFilter',
      valueFormatter: (p) => dash(p.value),
    },
    {
      colId: COL_UNIDADE,
      field: 'unidadeMedida',
      headerName: labels.unidade,
      width: 110,
      minWidth: 96,
      maxWidth: 140,
      editable: false,
      filter: 'agTextColumnFilter',
      type: 'rightAligned',
      cellClass: 'produtos-grid__cell--numeric',
    },
    {
      colId: 'acoes',
      headerName: labels.acoes,
      width: 90,
      minWidth: 84,
      maxWidth: 104,
      pinned: 'right',
      sortable: false,
      filter: false,
      floatingFilter: false,
      suppressMovable: true,
      cellClass: 'produtos-grid__cell--acoes',
      cellRenderer: ProdutoAcoesCell,
    },
  ];
}
