import React, { useCallback, useMemo } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { AllEnterpriseModule } from 'ag-grid-enterprise';
import {
  type ColDef,
  type GridApi,
  type GridReadyEvent,
  themeQuartz,
} from 'ag-grid-community';
import 'ag-grid-community/styles/ag-grid.css';
import type { AgGridReactProps } from 'ag-grid-react';
import { adminCatalogQuartzTheme } from '../../agGrid/adminCatalogQuartzTheme';
import { agGridLucideIcons } from '../../agGrid/agGridLucideIcons';
import {
  BASE_GRID_ADMIN_CATALOG_COL_DEF,
  BASE_GRID_DEFAULT_COL_DEF,
  BASE_GRID_DEFAULT_ROW_SELECTION,
  BASE_GRID_INFINITE_DEFAULTS,
} from './baseGridDefaults';

/** `adminCatalog`: tema escuro ERP + colunas sem filtro de cabeçalho (produtos, logs, etc.). */
export type BaseGridVariant = 'default' | 'adminCatalog';

export type BaseGridProps<TData = unknown> = Omit<
  AgGridReactProps<TData>,
  'modules' | 'theme' | 'onGridReady'
> & {
  /** Identidade visual compartilhada dos grids SSRM administrativos. */
  variant?: BaseGridVariant;
  /** Tema AG Grid; com `variant="adminCatalog"` o padrão é {@link adminCatalogQuartzTheme}. */
  theme?: AgGridReactProps<TData>['theme'];
  /** Com `variant="adminCatalog"`, default `true` se omitido. */
  loadThemeGoogleFonts?: boolean;
  /** Com `variant="adminCatalog"`, default `() => document.head` no browser. */
  themeStyleContainer?: AgGridReactProps<TData>['themeStyleContainer'];
  /** Mesclado por cima dos defaults do `variant` e de {@link BASE_GRID_DEFAULT_COL_DEF}. */
  defaultColDef?: ColDef<TData>;
  /** Se informado, recebe a API quando o grid estiver pronto. */
  gridApiRef?: React.RefObject<GridApi<TData> | null>;
  onGridReady?: (event: GridReadyEvent<TData>) => void;
  /**
   * Substitui a seleção padrão. Use `false` para não aplicar o preset de multiseleção.
   * Com `variant="adminCatalog"` e omitido, não há seleção por linhas (grid só leitura até passar `rowSelection`).
   */
  rowSelection?: AgGridReactProps<TData>['rowSelection'] | false;
};

/**
 * Shell do AG Grid com módulos, tema, defaults e variantes de identidade visual.
 * Use `variant="adminCatalog"` para alinhar a produtos/logs (tema Quartz ERP + colunas catálogo).
 */
function BaseGrid<TData = unknown>(props: BaseGridProps<TData>): React.ReactElement {
  const {
    variant = 'default',
    gridApiRef,
    onGridReady: userOnGridReady,
    defaultColDef: userDefaultColDef,
    rowSelection: rowSelectionProp,
    theme: themeProp,
    loadThemeGoogleFonts: loadThemeGoogleFontsProp,
    themeStyleContainer: themeStyleContainerProp,
    rowModelType,
    cacheBlockSize,
    maxBlocksInCache,
    maxConcurrentDatasourceRequests,
    icons: userIcons,
    ...agGridProps
  } = props;

  const isAdminCatalog = variant === 'adminCatalog';

  const mergedDefaultColDef = useMemo<ColDef<TData>>(
    () => ({
      ...(BASE_GRID_DEFAULT_COL_DEF as ColDef<TData>),
      ...(isAdminCatalog ? (BASE_GRID_ADMIN_CATALOG_COL_DEF as ColDef<TData>) : {}),
      ...userDefaultColDef,
    }),
    [isAdminCatalog, userDefaultColDef]
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

  const rowSelection = useMemo(() => {
    if (rowSelectionProp === false) {
      return undefined;
    }
    if (rowSelectionProp !== undefined) {
      return rowSelectionProp;
    }
    if (isAdminCatalog) {
      return undefined;
    }
    return BASE_GRID_DEFAULT_ROW_SELECTION;
  }, [isAdminCatalog, rowSelectionProp]);

  const infinitePaginationProps =
    rowModelType === 'infinite'
      ? {
          cacheBlockSize: cacheBlockSize ?? BASE_GRID_INFINITE_DEFAULTS.cacheBlockSize,
          maxBlocksInCache: maxBlocksInCache ?? BASE_GRID_INFINITE_DEFAULTS.maxBlocksInCache,
          maxConcurrentDatasourceRequests:
            maxConcurrentDatasourceRequests ?? BASE_GRID_INFINITE_DEFAULTS.maxConcurrentDatasourceRequests,
        }
      : {};

  const theme = themeProp ?? (isAdminCatalog ? adminCatalogQuartzTheme : themeQuartz);

  const loadThemeGoogleFonts =
    loadThemeGoogleFontsProp !== undefined ? loadThemeGoogleFontsProp : isAdminCatalog;

  const themeStyleContainer =
    themeStyleContainerProp !== undefined
      ? themeStyleContainerProp
      : isAdminCatalog && typeof document !== 'undefined'
        ? () => document.head
        : undefined;

  const mergedIcons = useMemo(
    () => (userIcons ? { ...agGridLucideIcons, ...userIcons } : agGridLucideIcons),
    [userIcons]
  );

  return (
    <AgGridReact<TData>
      modules={[AllEnterpriseModule]}
      theme={theme}
      icons={mergedIcons}
      defaultColDef={mergedDefaultColDef}
      rowSelection={rowSelection}
      rowModelType={rowModelType}
      onGridReady={handleGridReady}
      {...(loadThemeGoogleFonts ? { loadThemeGoogleFonts: true } : {})}
      {...(themeStyleContainer ? { themeStyleContainer } : {})}
      {...infinitePaginationProps}
      {...agGridProps}
    />
  );
}

export default BaseGrid;
