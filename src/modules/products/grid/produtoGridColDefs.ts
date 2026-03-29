import type { ColDef } from 'ag-grid-community';
import type { ProdutoResumo } from '../services/produtoService';

/**
 * Definições de colunas do grid de produtos (somente visualização/edição; dados vêm do estado React).
 */
export function createProdutoGridColumnDefs(): ColDef<ProdutoResumo>[] {
  return [
    {
      field: 'id',
      headerName: 'ID',
      width: 100,
      editable: false,
      filter: 'agNumberColumnFilter',
    },
    {
      field: 'nome',
      headerName: 'Nome',
      flex: 1,
      minWidth: 180,
      editable: true,
      filter: 'agTextColumnFilter',
    },
    {
      field: 'marca',
      headerName: 'Marca',
      width: 160,
      editable: true,
      filter: 'agTextColumnFilter',
      valueFormatter: (p) => (p.value == null || p.value === '' ? '—' : String(p.value)),
    },
    {
      field: 'unidadeMedida',
      headerName: 'Unidade',
      width: 120,
      editable: true,
      filter: 'agTextColumnFilter',
    },
  ];
}
