import type { ColDef, RowSelectionOptions } from 'ag-grid-community';

/** Comportamento padrão de coluna (filtro/ordenação server-side quando combinado com rowModel infinite). */
export const BASE_GRID_DEFAULT_COL_DEF: ColDef = {
  sortable: true,
  resizable: true,
  filter: true,
  floatingFilter: true,
};

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
