import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import type {
  ColDef,
  ColumnVO,
  DomLayoutType,
  FirstDataRenderedEvent,
  GetRowIdParams,
  GridApi,
  GridOptions,
  GridReadyEvent,
  GridSizeChangedEvent,
  IServerSideDatasource,
  ModelUpdatedEvent,
  PaginationChangedEvent,
  RowSelectionOptions,
  SideBarDef,
} from 'ag-grid-community';
import { AG_GRID_LOCALE_BR } from '../../../shared/agGrid/agGridLocaleBR';
import { BaseGrid } from '../../../shared/components/grid';
import { authService } from '../../auth/services/authService';
import {
  createProdutoGridColumnDefs,
  PRODUTO_GRID_COL_ID,
  produtoGridSsrmCountAgg,
} from '../grid/produtoGridColDefs';
import {
  CATALOG_COLUMN_PANEL_HEAD_CSS,
  CATALOG_COLUMN_PANEL_HEAD_STYLE_ID,
} from '../grid/catalogColumnPanelHeadStyles';
import {
  CATALOG_GRID_HEADER_PX,
  CATALOG_SIDEBAR_PANEL_PX,
  produtosCatalogoQuartzTheme,
} from '../grid/produtosQuartzTheme';
import { useProdutoGridResponsiveLayout } from '../grid/useProdutoGridResponsiveLayout';
import {
  consultarProdutosGrid,
  type ProdutoGridColumnVo,
  type ProdutoGridRow,
} from '../services/produtoService';
import { FILTROS_ATIVOS_VAZIO, type ProdutoFiltrosAtivos } from '../types/categoriaTypes';
import { ProdutosGridEmptyOverlay } from './ProdutosGridEmptyOverlay';

/** Limite superior do bloco ao exibir “todos” (alinhado ao teto do servidor: 200 por requisição). */
const PRODUTOS_GRID_BLOCK_SIZE_ALL = 250_000;

export type ProdutosGridPageSizeOption = 10 | 20 | 50 | 70 | 100 | 'all';

const PAGE_SIZE_SELECTOR_VALUES: Array<10 | 20 | 50 | 70 | 100> = [10, 20, 50, 70, 100];

/** Enche a largura útil do corpo do grid sem `colDef.flex` (incompatível com esta estratégia na v33+). */
const PRODUTOS_GRID_AUTOSIZE_STRATEGY = {
  type: 'fitGridWidth' as const,
  defaultMinWidth: 96,
} satisfies GridOptions<ProdutoGridRow>['autoSizeStrategy'];

/**
 * Estado inicial: sem medidas em Valores; só o ID real fica forçado oculto.
 * Não incluir `ssrmCount_*` em hiddenColIds: com SSRM + Valores o grid precisa exibir a coluna de agregação;
 * manter ocultação via `hide: true` nas colDefs até o utilizador as meter em Valores.
 */
const PRODUTOS_GRID_INITIAL_STATE = {
  aggregation: { aggregationModel: [] as { colId: string; aggFunc: string }[] },
  columnVisibility: {
    hiddenColIds: [PRODUTO_GRID_COL_ID],
  },
} satisfies GridOptions<ProdutoGridRow>['initialState'];

const GRID_HEADER_PX = CATALOG_GRID_HEADER_PX;
const GRID_FLOATING_FILTERS_PX = 0;
const GRID_ROW_PX = 44;
const GRID_PAGING_PANEL_PX = 50;
const GRID_ALL_MODE_BODY_ROWS = 22;

/** Borda (px) junto ao `.admin-content` onde o movimento do rato faz scroll durante arraste de coluna. */
const ADMIN_DRAG_SCROLL_EDGE_PX = 80;
const ADMIN_DRAG_SCROLL_STEP_PX = 20;

const PRODUTOS_GRID_HOST_ID = 'dbmercado-produtos-grid-host';

function mapColumnVoList(cols: ColumnVO[]): ProdutoGridColumnVo[] {
  return cols.map((c) => ({
    id: c.id,
    displayName: c.displayName,
    field: c.field ?? null,
    aggFunc: c.aggFunc ?? null,
  }));
}

function allModeGridHostHeightPx(): number {
  return (
    GRID_HEADER_PX +
    GRID_FLOATING_FILTERS_PX +
    GRID_ALL_MODE_BODY_ROWS * GRID_ROW_PX +
    GRID_PAGING_PANEL_PX
  );
}

export function resolveProdutosGridBlockSize(option: ProdutosGridPageSizeOption): number {
  return option === 'all' ? PRODUTOS_GRID_BLOCK_SIZE_ALL : option;
}

export type ProdutosGridProps = {
  gridApiRef: React.RefObject<GridApi<ProdutoGridRow> | null>;
  /** Erro ao carregar bloco (ex.: notificação + i18n na página). */
  onDatasourceError?: (error: unknown) => void;
  className?: string;
  /** Quantidade de linhas por página (paginação + tamanho do bloco no SSRM). */
  pageSize: ProdutosGridPageSizeOption;
  /** Sincroniza estado ao mudar o tamanho da página pelo seletor do rodapé do AG Grid. */
  onPageSizeChange?: (size: ProdutosGridPageSizeOption) => void;
  /** Filtros do painel lateral (categoria + origem) enviados ao SSRM. */
  filtros?: ProdutoFiltrosAtivos;
  /**
   * Snapshot síncrono dos filtros para o POST do grid (atualizado no `setState` antes de `refreshServerSide`).
   * Opcional: sem ref, usa só `filtros` (pode ficar desatualizado num refresh imediato após mudar o painel).
   */
  filtrosConsultaRef?: React.RefObject<ProdutoFiltrosAtivos>;
};

/**
 * Catálogo ERP: com paginação 10–100 usa `domLayout: autoHeight` para não criar segunda barra de rolagem
 * (só `.admin-content` rola). Modo “todos” mantém viewport interna com altura máxima.
 */
function ProdutosGrid(props: ProdutosGridProps): React.ReactElement {
  const {
    gridApiRef,
    onDatasourceError,
    className,
    pageSize,
    onPageSizeChange,
    filtros = FILTROS_ATIVOS_VAZIO,
    filtrosConsultaRef,
  } = props;
  const { t } = useTranslation('common');
  const { onGridReady: onResponsiveGridReady, onFirstDataRendered } = useProdutoGridResponsiveLayout();

  const gridSizeFitDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dragAdminScrollCleanupRef = useRef<(() => void) | null>(null);
  /**
   * SSRM: não usar `paginationGetRowCount()` para vazio — pode ficar 0 fora de sincrono com o total real.
   * Guardamos o `rowCount` do último `params.success` (API .NET) e só mostramos o overlay quando o servidor
   * reporta total 0 (catálogo vazio ou filtro sem resultados naquele nível).
   */
  const ssrmLoadedAfterSuccessRef = useRef(false);
  const ssrmLastRowCountRef = useRef<number | null>(null);

  useEffect(() => {
    ssrmLoadedAfterSuccessRef.current = false;
    ssrmLastRowCountRef.current = null;
  }, [pageSize, filtros]);

  const stopDragAdminScroll = useCallback(() => {
    dragAdminScrollCleanupRef.current?.();
    dragAdminScrollCleanupRef.current = null;
  }, []);

  useLayoutEffect(() => {
    if (typeof document === 'undefined') {
      return;
    }
    let node = document.getElementById(CATALOG_COLUMN_PANEL_HEAD_STYLE_ID);
    if (!node) {
      node = document.createElement('style');
      node.id = CATALOG_COLUMN_PANEL_HEAD_STYLE_ID;
      document.head.appendChild(node);
    }
    node.textContent = CATALOG_COLUMN_PANEL_HEAD_CSS;
  }, []);

  useEffect(() => {
    return () => {
      if (gridSizeFitDebounceRef.current != null) {
        clearTimeout(gridSizeFitDebounceRef.current);
      }
      stopDragAdminScroll();
    };
  }, [stopDragAdminScroll]);

  const onDatasourceErrorRef = useRef(onDatasourceError);
  onDatasourceErrorRef.current = onDatasourceError;

  const catalogScrollMode = pageSize !== 'all';
  const domLayout: DomLayoutType = catalogScrollMode ? 'autoHeight' : 'normal';

  const blockSize = resolveProdutosGridBlockSize(pageSize);

  const syncNoRowsOverlayRef = useRef<((api: GridApi<ProdutoGridRow>) => void) | null>(null);

  const syncNoRowsOverlay = useCallback((api: GridApi<ProdutoGridRow>) => {
    if (api.isDestroyed() || !ssrmLoadedAfterSuccessRef.current) {
      return;
    }
    const serverTotal = ssrmLastRowCountRef.current ?? -1;
    if (serverTotal === 0) {
      api.showNoRowsOverlay();
    } else {
      api.hideOverlay();
    }
  }, []);

  syncNoRowsOverlayRef.current = syncNoRowsOverlay;

  const serverSideDatasource = useMemo<IServerSideDatasource<ProdutoGridRow>>(
    () => ({
      getRows: (params) => {
        if (!authService.isAuthenticated()) {
          ssrmLoadedAfterSuccessRef.current = false;
          params.fail();
          return;
        }

        void (async () => {
          try {
            const { request } = params;
            const filterModel = request.filterModel as Record<string, unknown> | null | undefined;
            const hasFilters = filterModel && Object.keys(filterModel).length > 0;
            const start = request.startRow ?? 0;
            const end = request.endRow ?? start + blockSize;
            const f = filtrosConsultaRef?.current ?? filtros;
            const result = await consultarProdutosGrid({
              startRow: start,
              endRow: end,
              sortModel: request.sortModel ?? [],
              filterModel: hasFilters ? filterModel : null,
              rowGroupCols: mapColumnVoList(request.rowGroupCols ?? []),
              groupKeys: request.groupKeys ?? [],
              valueCols: mapColumnVoList(request.valueCols ?? []),
              pivotMode: request.pivotMode ?? false,
              categoriaIdFiltro: f.categoriaId,
              origemFiltro: f.origem,
            });
            ssrmLastRowCountRef.current = result.rowCount;
            ssrmLoadedAfterSuccessRef.current = true;
            params.success({ rowData: result.rows, rowCount: result.rowCount });
            requestAnimationFrame(() => {
              if (!params.api.isDestroyed()) {
                syncNoRowsOverlayRef.current?.(params.api);
              }
            });
          } catch (error: unknown) {
            onDatasourceErrorRef.current?.(error);
            ssrmLoadedAfterSuccessRef.current = false;
            params.fail();
          }
        })();
      },
    }),
    [blockSize, filtros, filtrosConsultaRef]
  );

  const columnDefs = useMemo(
    () =>
      createProdutoGridColumnDefs({
        nome: t('modules.productsAdmin.fieldNome'),
        marca: t('modules.productsAdmin.fieldMarca'),
        categoria: t('modules.productsAdmin.fieldCategoria'),
        unidade: t('modules.productsAdmin.fieldUnidadeMedidaFisicaGrid'),
        acoes: t('modules.productsAdmin.columnAcoes'),
        countNome: t('modules.productsAdmin.gridValueCountNome'),
        countMarca: t('modules.productsAdmin.gridValueCountMarca'),
        countUnidade: t('modules.productsAdmin.gridValueCountUnidade'),
      }),
    [t]
  );

  const aggFuncs = useMemo(() => ({ count: produtoGridSsrmCountAgg }), []);

  const autoGroupColumnDef = useMemo<ColDef<ProdutoGridRow>>(
    () => ({
      minWidth: 200,
    }),
    []
  );

  /** Sem linha de filtro flutuante; filtros via painel lateral. Esconde o ícone de filtro no cabeçalho da coluna. */
  const catalogDefaultColDef = useMemo<ColDef<ProdutoGridRow>>(
    () => ({
      floatingFilter: false,
      suppressHeaderFilterButton: true,
    }),
    []
  );

  const rowSelection = useMemo<RowSelectionOptions<ProdutoGridRow>>(
    () => ({
      mode: 'multiRow',
      checkboxes: false,
      headerCheckbox: false,
      enableClickSelection: true,
    }),
    []
  );

  const sideBar = useMemo<SideBarDef>(
    () => ({
      position: 'right',
      toolPanels: [
        {
          id: 'columns',
          labelDefault: 'Colunas',
          labelKey: 'columns',
          iconKey: 'columns',
          toolPanel: 'agColumnsToolPanel',
          width: CATALOG_SIDEBAR_PANEL_PX,
          minWidth: 320,
          maxWidth: 640,
          toolPanelParams: {
            suppressPivotMode: true,
            suppressPivots: true,
            suppressValues: false,
          },
        },
        {
          id: 'filters',
          labelDefault: 'Filtros',
          labelKey: 'filters',
          iconKey: 'filtersToolPanel',
          toolPanel: 'agFiltersToolPanel',
          width: CATALOG_SIDEBAR_PANEL_PX,
          minWidth: 320,
          maxWidth: 640,
        },
      ],
    }),
    []
  );

  const agGridLocale = useMemo(
    () => ({
      ...AG_GRID_LOCALE_BR,
      page: t('modules.productsAdmin.agPaginationPage'),
      more: t('modules.productsAdmin.agPaginationMore'),
      to: t('modules.productsAdmin.agPaginationTo'),
      of: t('modules.productsAdmin.agPaginationOf'),
      pageLastRowUnknown: t('modules.productsAdmin.agPaginationPageLastRowUnknown'),
      firstPage: t('modules.productsAdmin.agPaginationFirstPage'),
      previousPage: t('modules.productsAdmin.agPaginationPreviousPage'),
      nextPage: t('modules.productsAdmin.agPaginationNextPage'),
      lastPage: t('modules.productsAdmin.agPaginationLastPage'),
      pageSizeSelectorLabel: t('modules.productsAdmin.agPageSizeSelectorLabel'),
      ariaPageSizeSelectorLabel: t('modules.productsAdmin.agAriaPageSizeSelector'),
    }),
    [t]
  );

  const handlePaginationChanged = useCallback(
    (event: PaginationChangedEvent<ProdutoGridRow>) => {
      if (!event.newPageSize || !onPageSizeChange) {
        return;
      }
      const next = event.api.paginationGetPageSize();
      if (next === PRODUTOS_GRID_BLOCK_SIZE_ALL) {
        onPageSizeChange('all');
        return;
      }
      if (PAGE_SIZE_SELECTOR_VALUES.includes(next as 10 | 20 | 50 | 70 | 100)) {
        onPageSizeChange(next as 10 | 20 | 50 | 70 | 100);
      }
    },
    [onPageSizeChange]
  );

  /**
   * O AG Grid não faz auto-scroll no documento durante arraste. Com scroll só na janela (`.admin-content`
   * em `overflow: visible`), aproximar o rato do topo/fundo do viewport faz `window.scrollBy`.
   */
  const handleDragStarted = useCallback(() => {
    stopDragAdminScroll();

    const onMove = (ev: MouseEvent): void => {
      const y = ev.clientY;
      if (y > window.innerHeight - ADMIN_DRAG_SCROLL_EDGE_PX) {
        window.scrollBy(0, ADMIN_DRAG_SCROLL_STEP_PX);
      } else if (y < ADMIN_DRAG_SCROLL_EDGE_PX) {
        window.scrollBy(0, -ADMIN_DRAG_SCROLL_STEP_PX);
      }
    };

    window.addEventListener('mousemove', onMove, { capture: true });
    const cleanup = (): void => {
      window.removeEventListener('mousemove', onMove, { capture: true });
    };
    dragAdminScrollCleanupRef.current = cleanup;
  }, [stopDragAdminScroll]);

  const handleDragStopped = useCallback(() => {
    stopDragAdminScroll();
  }, [stopDragAdminScroll]);

  const handleDragCancelled = useCallback(() => {
    stopDragAdminScroll();
  }, [stopDragAdminScroll]);

  const handleGridReady = useCallback(
    (event: GridReadyEvent<ProdutoGridRow>) => {
      onResponsiveGridReady(event);
      const api = event.api;
      const onPanelDragStart = (): void => {
        handleDragStarted();
      };
      const onPanelDragEnd = (): void => {
        stopDragAdminScroll();
      };
      /* columnPanelItem* não estão em AgPublicEventType mas existem em runtime (Enterprise). */
      const apiPanel = api as unknown as {
        addEventListener(type: 'columnPanelItemDragStart', fn: () => void): void;
        addEventListener(type: 'columnPanelItemDragEnd', fn: () => void): void;
      };
      apiPanel.addEventListener('columnPanelItemDragStart', onPanelDragStart);
      apiPanel.addEventListener('columnPanelItemDragEnd', onPanelDragEnd);
    },
    [onResponsiveGridReady, handleDragStarted, stopDragAdminScroll]
  );

  const handleFirstDataRendered = useCallback(
    (event: FirstDataRenderedEvent<ProdutoGridRow>) => {
      onFirstDataRendered(event);
      requestAnimationFrame(() => {
        syncNoRowsOverlay(event.api);
        if (!event.api.isDestroyed()) {
          event.api.sizeColumnsToFit();
        }
      });
    },
    [onFirstDataRendered, syncNoRowsOverlay]
  );

  const handleModelUpdated = useCallback(
    (event: ModelUpdatedEvent<ProdutoGridRow>) => {
      if (!ssrmLoadedAfterSuccessRef.current) {
        return;
      }
      requestAnimationFrame(() => syncNoRowsOverlay(event.api));
    },
    [syncNoRowsOverlay]
  );

  const handleGridSizeChanged = useCallback((event: GridSizeChangedEvent<ProdutoGridRow>) => {
    if (gridSizeFitDebounceRef.current != null) {
      clearTimeout(gridSizeFitDebounceRef.current);
    }
    gridSizeFitDebounceRef.current = setTimeout(() => {
      gridSizeFitDebounceRef.current = null;
      if (!event.api.isDestroyed()) {
        event.api.sizeColumnsToFit();
      }
    }, 80);
  }, []);

  const getRowId = useCallback((p: GetRowIdParams<ProdutoGridRow>) => {
    const d = p.data;
    if (d == null) {
      return '';
    }
    if (d.isGroup) {
      const route = [...(p.parentKeys ?? []), d.groupKey ?? ''].join('/');
      return `g:${route}`;
    }
    return String(d.id ?? '');
  }, []);

  const isServerSideGroup = useCallback((data: ProdutoGridRow) => data.isGroup === true, []);

  const getServerSideGroupKey = useCallback((data: ProdutoGridRow) => data.groupKey ?? '', []);

  return (
    <div
      id={PRODUTOS_GRID_HOST_ID}
      className={`produtos-grid-host produtos-grid-host--erp w-full min-w-0 ${catalogScrollMode ? 'produtos-grid-host--catalog-scroll' : ''} ${className ?? ''}`}
      style={catalogScrollMode ? undefined : { height: allModeGridHostHeightPx() }}
    >
      <BaseGrid<ProdutoGridRow>
        key={`produtos-grid-${pageSize}`}
        className={catalogScrollMode ? 'w-full min-w-0' : 'h-full w-full min-w-0'}
        theme={produtosCatalogoQuartzTheme}
        loadThemeGoogleFonts
        themeStyleContainer={typeof document !== 'undefined' ? () => document.head : undefined}
        noRowsOverlayComponent={ProdutosGridEmptyOverlay}
        sideBar={sideBar}
        gridApiRef={gridApiRef}
        initialState={PRODUTOS_GRID_INITIAL_STATE}
        autoSizeStrategy={PRODUTOS_GRID_AUTOSIZE_STRATEGY}
        maintainColumnOrder
        defaultColDef={catalogDefaultColDef}
        columnDefs={columnDefs}
        autoGroupColumnDef={autoGroupColumnDef}
        rowSelection={rowSelection}
        rowModelType="serverSide"
        serverSideDatasource={serverSideDatasource}
        getRowId={getRowId}
        isServerSideGroup={isServerSideGroup}
        getServerSideGroupKey={getServerSideGroupKey}
        rowGroupPanelShow="always"
        pivotPanelShow="never"
        suppressAggFuncInHeader={false}
        allowDragFromColumnsToolPanel
        aggFuncs={aggFuncs}
        domLayout={domLayout}
        rowHeight={GRID_ROW_PX}
        headerHeight={GRID_HEADER_PX}
        floatingFiltersHeight={GRID_FLOATING_FILTERS_PX}
        pagination
        paginationPageSize={blockSize}
        paginationPageSizeSelector={false}
        cacheBlockSize={blockSize}
        localeText={agGridLocale}
        alwaysShowVerticalScroll={false}
        onGridReady={handleGridReady}
        onFirstDataRendered={handleFirstDataRendered}
        onModelUpdated={handleModelUpdated}
        onGridSizeChanged={handleGridSizeChanged}
        onDragStarted={handleDragStarted}
        onDragStopped={handleDragStopped}
        onDragCancelled={handleDragCancelled}
        onPaginationChanged={handlePaginationChanged}
        enableCellTextSelection
      />
    </div>
  );
}

export default ProdutosGrid;
