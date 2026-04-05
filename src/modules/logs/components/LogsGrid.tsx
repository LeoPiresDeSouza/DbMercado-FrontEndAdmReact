import React, { useCallback, useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import type {
  ColDef,
  FirstDataRenderedEvent,
  GetRowIdParams,
  GridApi,
  GridOptions,
  GridReadyEvent,
  GridSizeChangedEvent,
  IServerSideDatasource,
  RowClickedEvent,
} from 'ag-grid-community';
import { AlertTriangle, Trash2 } from 'lucide-react';
import { AG_GRID_LOCALE_BR } from '../../../shared/agGrid/agGridLocaleBR';
import { CATALOG_GRID_HEADER_PX } from '../../../shared/agGrid/adminCatalogQuartzTheme';
import { BaseGrid, BASE_GRID_ADMIN_CATALOG_AUTOSIZE_STRATEGY } from '../../../shared/components/grid';
import { authService } from '../../auth/services/authService';
import { consultarAppLogsGrid, type AppLogGridRow } from '../services/appLogService';

const GRID_ROW_PX = 44;
/** Alinhado ao clamp do servidor (`AppLogService`: máx. 500 linhas por requisição). */
const LOGS_GRID_MAX_BLOCK = 500;

const LOGS_GRID_HOST_ID = 'dbmercado-logs-grid-host';

export type LogsGridPageSizeOption = 10 | 20 | 50 | 70 | 100 | 'all';

export function resolveLogsGridBlockSize(option: LogsGridPageSizeOption): number {
  return option === 'all' ? LOGS_GRID_MAX_BLOCK : option;
}

/** Coluna fixa de exclusão — cliques aqui não devem abrir o detalhe da linha. */
const LOGS_GRID_COL_ID_ACOES = 'acoes';

const LOGS_GRID_INITIAL_STATE = {
  sort: {
    sortModel: [{ colId: 'createdAt', sort: 'desc' as const }],
  },
} satisfies GridOptions<AppLogGridRow>['initialState'];

export type LogsFiltrosConsulta = {
  dataInicio: string | null;
  dataFim: string | null;
  somenteComExcecao: boolean;
  levels: string[];
};

export const LOGS_FILTROS_VAZIO: LogsFiltrosConsulta = {
  dataInicio: null,
  dataFim: null,
  somenteComExcecao: false,
  levels: [],
};

export type LogsGridProps = {
  gridApiRef: React.RefObject<GridApi<AppLogGridRow> | null>;
  filtrosConsultaRef: React.RefObject<LogsFiltrosConsulta>;
  onDatasourceError?: (error: unknown) => void;
  onRowOpen: (row: AppLogGridRow) => void;
  /** Tamanho de página SSRM + paginação (rótulos iguais ao grid de produtos). */
  pageSize: LogsGridPageSizeOption;
  /** Coluna de exclusão só é exibida com permissão `excluirEntrada`. */
  podeExcluir?: boolean;
  onRequestDeleteRow?: (row: AppLogGridRow) => void;
};

function levelStyle(level: string): React.CSSProperties {
  const u = level.toUpperCase();
  const base: React.CSSProperties = {
    display: 'inline-block',
    padding: '2px 8px',
    borderRadius: 6,
    fontSize: 11,
    fontWeight: 600,
    letterSpacing: '0.02em',
  };
  if (u === 'TRACE') return { ...base, background: '#718096', color: '#0f1419' };
  if (u === 'DEBUG') return { ...base, background: '#ADB5BD', color: '#0f1419' };
  if (u === 'INFORMATION') return { ...base, background: '#0D6EFD', color: '#fff' };
  if (u === 'WARNING') return { ...base, background: '#FFC107', color: '#0f1419' };
  if (u === 'ERROR' || u === 'CRITICAL')
    return { ...base, background: '#DC3545', color: '#fff', border: u === 'CRITICAL' ? '2px solid #ff6b6b' : undefined };
  return { ...base, background: '#4a5568', color: '#fff' };
}

export function LogsGrid(props: LogsGridProps): React.ReactElement {
  const { gridApiRef, filtrosConsultaRef, onDatasourceError, onRowOpen, pageSize, podeExcluir = false, onRequestDeleteRow } = props;
  const { t } = useTranslation('common');
  const blockSize = resolveLogsGridBlockSize(pageSize);
  const onErrorRef = useRef(onDatasourceError);
  onErrorRef.current = onDatasourceError;
  const onDeleteRowRef = useRef(onRequestDeleteRow);
  onDeleteRowRef.current = onRequestDeleteRow;
  const gridSizeFitDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const serverSideDatasource = useMemo<IServerSideDatasource<AppLogGridRow>>(
    () => ({
      getRows: (params) => {
        if (!authService.isAuthenticated()) {
          params.fail();
          return;
        }
        void (async () => {
          try {
            const { request } = params;
            const start = request.startRow ?? 0;
            const end = request.endRow ?? start + blockSize;
            const f = filtrosConsultaRef.current ?? LOGS_FILTROS_VAZIO;
            const result = await consultarAppLogsGrid({
              startRow: start,
              endRow: end,
              sortModel: request.sortModel ?? [],
              dataInicio: f.dataInicio ? new Date(f.dataInicio).toISOString() : null,
              dataFim: f.dataFim ? new Date(f.dataFim).toISOString() : null,
              somenteComExcecao: f.somenteComExcecao,
              levels: f.levels.length > 0 ? f.levels : null,
            });
            params.success({ rowData: result.rows, rowCount: result.rowCount });
          } catch (error: unknown) {
            onErrorRef.current?.(error);
            params.fail();
          }
        })();
      },
    }),
    [blockSize, filtrosConsultaRef]
  );

  const columnDefs = useMemo<ColDef<AppLogGridRow>[]>(() => {
    const base: ColDef<AppLogGridRow>[] = [
      {
        field: 'createdAt',
        headerName: t('modules.logsAdmin.colCreatedAt'),
        flex: 1,
        minWidth: 160,
        valueFormatter: (p) => {
          const v = p.value as string | undefined;
          if (!v) return '';
          const d = new Date(v);
          return Number.isNaN(d.getTime())
            ? v
            : new Intl.DateTimeFormat(undefined, {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
              }).format(d);
        },
      },
      {
        field: 'level',
        headerName: t('modules.logsAdmin.colLevel'),
        width: 130,
        cellRenderer: (p: { value?: string }) => (
          <span style={levelStyle(p.value ?? '')}>{p.value ?? ''}</span>
        ),
      },
      { field: 'category', headerName: t('modules.logsAdmin.colCategory'), flex: 1, minWidth: 140 },
      { field: 'message', headerName: t('modules.logsAdmin.colMessage'), flex: 2, minWidth: 200 },
      { field: 'userName', headerName: t('modules.logsAdmin.colUser'), flex: 1, minWidth: 120 },
      { field: 'path', headerName: t('modules.logsAdmin.colPath'), flex: 1, minWidth: 120 },
      { field: 'method', headerName: t('modules.logsAdmin.colMethod'), width: 90 },
      {
        field: 'hasException',
        headerName: t('modules.logsAdmin.colException'),
        width: 100,
        sortable: false,
        cellRenderer: (p: { data?: AppLogGridRow }) =>
          p.data?.hasException ? (
            <span className="flex items-center justify-center text-amber-400" title={t('modules.logsAdmin.hasExceptionHint')}>
              <AlertTriangle className="h-5 w-5" aria-hidden />
            </span>
          ) : null,
      },
    ];
    if (podeExcluir) {
      base.push({
        colId: LOGS_GRID_COL_ID_ACOES,
        headerName: t('modules.logsAdmin.colAcoes'),
        width: 72,
        minWidth: 64,
        maxWidth: 88,
        suppressSizeToFit: true,
        pinned: 'right',
        sortable: false,
        filter: false,
        floatingFilter: false,
        suppressMovable: true,
        cellClass: 'produtos-grid__cell--acoes',
        cellRenderer: (p: { data?: AppLogGridRow }) => {
          const row = p.data;
          if (row == null) {
            return null;
          }
          return (
            <div className="produto-acoes-cell-inner flex h-full items-center justify-center">
              <button
                type="button"
                className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-md text-[#DC3545] transition-colors hover:bg-[#DC3545]/15 hover:text-[#ff6b6b]"
                title={t('modules.logsAdmin.deleteEntry')}
                aria-label={t('modules.logsAdmin.deleteEntryAria', { id: row.id })}
                onMouseDown={(e) => {
                  e.stopPropagation();
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  onDeleteRowRef.current?.(row);
                }}
              >
                <Trash2 className="h-4 w-4" aria-hidden />
              </button>
            </div>
          );
        },
      });
    }
    return base;
  }, [t, podeExcluir]);

  const defaultColDef = useMemo<ColDef<AppLogGridRow>>(
    () => ({
      tooltipValueGetter: (p) => {
        const v = p.value;
        return v != null && String(v).length > 80 ? String(v) : undefined;
      },
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
    }),
    [t]
  );

  const getRowId = useCallback((p: GetRowIdParams<AppLogGridRow>) => String(p.data?.id ?? ''), []);

  const onRowClicked = useCallback(
    (e: RowClickedEvent<AppLogGridRow>) => {
      const colId = (e as { column?: { getColId?: () => string } }).column?.getColId?.();
      if (colId === LOGS_GRID_COL_ID_ACOES) {
        return;
      }
      const target = e.event?.target;
      if (target instanceof Element && target.closest('.produto-acoes-cell-inner')) {
        return;
      }
      if (e.data) {
        onRowOpen(e.data);
      }
    },
    [onRowOpen]
  );

  const onGridReady = useCallback((e: GridReadyEvent<AppLogGridRow>) => {
    requestAnimationFrame(() => {
      if (!e.api.isDestroyed()) {
        e.api.sizeColumnsToFit();
      }
    });
  }, []);

  const onFirstDataRendered = useCallback((e: FirstDataRenderedEvent<AppLogGridRow>) => {
    requestAnimationFrame(() => {
      if (!e.api.isDestroyed()) {
        e.api.sizeColumnsToFit();
      }
    });
  }, []);

  const onGridSizeChanged = useCallback((e: GridSizeChangedEvent<AppLogGridRow>) => {
    if (gridSizeFitDebounceRef.current != null) {
      clearTimeout(gridSizeFitDebounceRef.current);
    }
    gridSizeFitDebounceRef.current = setTimeout(() => {
      gridSizeFitDebounceRef.current = null;
      if (!e.api.isDestroyed()) {
        e.api.sizeColumnsToFit();
      }
    }, 80);
  }, []);

  return (
    <div
      id={LOGS_GRID_HOST_ID}
      className="produtos-grid-host produtos-grid-host--erp admin-ssrm-grid-host produtos-grid-host--catalog-scroll w-full min-w-0"
    >
      <BaseGrid<AppLogGridRow>
        key={`logs-grid-${pageSize}`}
        variant="adminCatalog"
        className="w-full min-w-0"
        gridApiRef={gridApiRef}
        initialState={LOGS_GRID_INITIAL_STATE}
        autoSizeStrategy={BASE_GRID_ADMIN_CATALOG_AUTOSIZE_STRATEGY}
        maintainColumnOrder
        columnDefs={columnDefs}
        defaultColDef={defaultColDef}
        rowModelType="serverSide"
        serverSideDatasource={serverSideDatasource}
        getRowId={getRowId}
        domLayout="autoHeight"
        rowHeight={GRID_ROW_PX}
        headerHeight={CATALOG_GRID_HEADER_PX}
        floatingFiltersHeight={0}
        pagination
        paginationPageSize={blockSize}
        paginationPageSizeSelector={false}
        cacheBlockSize={blockSize}
        maxConcurrentDatasourceRequests={1}
        localeText={agGridLocale}
        alwaysShowVerticalScroll={false}
        onRowClicked={onRowClicked}
        onGridReady={onGridReady}
        onFirstDataRendered={onFirstDataRendered}
        onGridSizeChanged={onGridSizeChanged}
        enableCellTextSelection
      />
    </div>
  );
}
