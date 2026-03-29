import type { ColDef } from 'ag-grid-community';
import type { ProdutoResumo } from '../services/produtoService';
import { ProdutoAcoesCell } from './ProdutoAcoesCell';

export type ProdutoGridColDefOptions = {
  acoesHeader: string;
};

/**
 * Definições de colunas do grid de produtos (filtro/ordenação repassados ao servidor via infinite datasource).
 */
export function createProdutoGridColumnDefs(options: ProdutoGridColDefOptions): ColDef<ProdutoResumo>[] {
  return [
    {
      colId: 'id',
      field: 'id',
      headerName: 'ID',
      width: 100,
      hide: true,
      editable: false,
      filter: 'agNumberColumnFilter',
      cellClass: 'text-sm text-gray-900 text-right font-medium',
    },
    {
      field: 'nome',
      headerName: 'Nome',
      flex: 1,
      minWidth: 180,
      editable: false,
      filter: 'agTextColumnFilter',
    },
    {
      field: 'marca',
      headerName: 'Marca',
      width: 160,
      editable: false,
      filter: 'agTextColumnFilter',
      valueFormatter: (p) => (p.value == null || p.value === '' ? '—' : String(p.value)),
    },
    {
      field: 'unidadeMedida',
      headerName: 'Unidade',
      width: 120,
      editable: false,
      filter: 'agTextColumnFilter',
    },
    {
      colId: 'acoes',
      headerName: options.acoesHeader,
      width: 100,
      pinned: 'right',
      sortable: false,
      filter: false,
      floatingFilter: false,
      suppressMovable: true,
      cellClass: 'flex items-center',
      cellRenderer: ProdutoAcoesCell,
    },
  ];
}
