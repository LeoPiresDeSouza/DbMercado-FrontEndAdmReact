import type { ColDef, GridOptions, RowSelectionOptions } from 'ag-grid-community';

/** Comportamento padrão de coluna (filtro/ordenação server-side quando combinado com rowModel infinite). */
export const BASE_GRID_DEFAULT_COL_DEF: ColDef = {
  sortable: true,
  resizable: true,
  filter: true,
  floatingFilter: true,
};

/**
 * Colunas no estilo catálogo admin: sem filtro flutuante no header.
 * Aplicado por {@link BaseGrid} quando `variant="adminCatalog"`.
 */
export const BASE_GRID_ADMIN_CATALOG_COL_DEF: ColDef = {
  sortable: true,
  resizable: true,
  filter: false,
  floatingFilter: false,
  suppressHeaderFilterButton: true,
};

/** Largura de colunas como no grid de produtos (`fitGridWidth`). */
export const BASE_GRID_ADMIN_CATALOG_AUTOSIZE_STRATEGY = {
  type: 'fitGridWidth' as const,
  defaultMinWidth: 96,
} satisfies GridOptions['autoSizeStrategy'];

/** Valores padrão para row model infinite (paginação por blocos no servidor). */
export const BASE_GRID_INFINITE_DEFAULTS = {
  cacheBlockSize: 100,
  maxBlocksInCache: 20,
  maxConcurrentDatasourceRequests: 1,
} as const;

/** Seleção múltipla com checkbox — pode ser substituída pelo consumidor. */
export const BASE_GRID_DEFAULT_ROW_SELECTION: RowSelectionOptions = {
  mode: 'multiRow',
  checkboxes: true,
  headerCheckbox: true,
  enableClickSelection: true,
};
