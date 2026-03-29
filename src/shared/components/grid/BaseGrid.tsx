import React, { useCallback, useMemo } from 'react';
import { AgGridReact } from 'ag-grid-react';
import {
  AllCommunityModule,
  type ColDef,
  type GridApi,
  type GridReadyEvent,
  themeQuartz,
} from 'ag-grid-community';
import 'ag-grid-community/styles/ag-grid.css';
import type { AgGridReactProps } from 'ag-grid-react';
import {
  BASE_GRID_DEFAULT_COL_DEF,
  BASE_GRID_DEFAULT_ROW_SELECTION,
  BASE_GRID_INFINITE_DEFAULTS,
} from './baseGridDefaults';

export type BaseGridProps<TData = unknown> = Omit<AgGridReactProps<TData>, 'modules' | 'theme' | 'onGridReady'> & {
  /** Mesclado por cima de {@link BASE_GRID_DEFAULT_COL_DEF}. */
  defaultColDef?: ColDef<TData>;
  /** Se informado, recebe a API quando o grid estiver pronto. */
  gridApiRef?: React.RefObject<GridApi<TData> | null>;
  onGridReady?: (event: GridReadyEvent<TData>) => void;
  /**
   * Substitui a seleção padrão. Use `false` para não aplicar o preset de multiseleção
   * (o AG Grid volta ao próprio default da versão em uso).
   */
  rowSelection?: AgGridReactProps<TData>['rowSelection'] | false;
};

/**
 * Shell do AG Grid com módulos, tema, defaults de coluna, seleção e presets de infinite row model.
 * Sem regras de negócio: não define colunas, datasource nem chamadas HTTP.
 */
function BaseGrid<TData = unknown>(props: BaseGridProps<TData>): React.ReactElement {
  const {
    gridApiRef,
    onGridReady: userOnGridReady,
    defaultColDef: userDefaultColDef,
    rowSelection: rowSelectionProp,
    rowModelType,
    cacheBlockSize,
    maxBlocksInCache,
    maxConcurrentDatasourceRequests,
    ...agGridProps
  } = props;

  const mergedDefaultColDef = useMemo<ColDef<TData>>(
    () => ({
      ...(BASE_GRID_DEFAULT_COL_DEF as ColDef<TData>),
      ...userDefaultColDef,
    }),
    [userDefaultColDef]
  );

  const handleGridReady = useCallback(
    (event: GridReadyEvent<TData>) => {
      if (gridApiRef) {
        gridApiRef.current = event.api;
      }
      userOnGridReady?.(event);
    },
    [gridApiRef, userOnGridReady]
  );

  const rowSelection =
    rowSelectionProp === false ? undefined : (rowSelectionProp ?? BASE_GRID_DEFAULT_ROW_SELECTION);

  const infinitePaginationProps =
    rowModelType === 'infinite'
      ? {
          cacheBlockSize: cacheBlockSize ?? BASE_GRID_INFINITE_DEFAULTS.cacheBlockSize,
          maxBlocksInCache: maxBlocksInCache ?? BASE_GRID_INFINITE_DEFAULTS.maxBlocksInCache,
          maxConcurrentDatasourceRequests:
            maxConcurrentDatasourceRequests ?? BASE_GRID_INFINITE_DEFAULTS.maxConcurrentDatasourceRequests,
        }
      : {};

  return (
    <AgGridReact<TData>
      modules={[AllCommunityModule]}
      theme={themeQuartz}
      defaultColDef={mergedDefaultColDef}
      rowSelection={rowSelection}
      rowModelType={rowModelType}
      onGridReady={handleGridReady}
      {...infinitePaginationProps}
      {...agGridProps}
    />
  );
}

export default BaseGrid;
