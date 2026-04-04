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
import { AG_GRID_LOCALE_BR } from '../../../shared/agGrid/agGridLocaleBR';
import { CATALOG_GRID_HEADER_PX } from '../../../shared/agGrid/adminCatalogQuartzTheme';
import { BaseGrid, BASE_GRID_ADMIN_CATALOG_AUTOSIZE_STRATEGY } from '../../../shared/components/grid';
import { authService } from '../../auth/services/authService';
import { consultarJobExecucoesGrid, type JobExecucaoGridRow } from '../services/jobExecucaoService';

const GRID_ROW_PX = 44;
const JOB_EXEC_GRID_MAX_BLOCK = 500;

const JOB_EXEC_GRID_HOST_ID = 'dbmercado-job-exec-grid-host';

export type JobExecucoesGridPageSizeOption = 10 | 20 | 50 | 70 | 100 | 'all';

export function resolveJobExecucoesGridBlockSize(option: JobExecucoesGridPageSizeOption): number {
  return option === 'all' ? JOB_EXEC_GRID_MAX_BLOCK : option;
}

const JOB_EXEC_GRID_INITIAL_STATE = {
  sort: {
    sortModel: [{ colId: 'inicioUtc', sort: 'desc' as const }],
  },
} satisfies GridOptions<JobExecucaoGridRow>['initialState'];

export type JobExecucoesFiltrosConsulta = {
  dataInicio: string | null;
  dataFim: string | null;
  jobNome: string;
  resultado: 'todos' | 'sucesso' | 'falha' | 'emAndamento';
};

export const JOB_EXEC_FILTROS_VAZIO: JobExecucoesFiltrosConsulta = {
  dataInicio: null,
  dataFim: null,
  jobNome: '',
  resultado: 'todos',
};

export type JobExecucoesGridProps = {
  gridApiRef: React.RefObject<GridApi<JobExecucaoGridRow> | null>;
  filtrosConsultaRef: React.RefObject<JobExecucoesFiltrosConsulta>;
  onDatasourceError?: (error: unknown) => void;
  onRowOpen: (row: JobExecucaoGridRow) => void;
  pageSize: JobExecucoesGridPageSizeOption;
};

function formatDateTime(iso: string | undefined): string {
  if (!iso) return '';
  const d = new Date(iso);
  return Number.isNaN(d.getTime())
    ? iso
    : new Intl.DateTimeFormat(undefined, {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      }).format(d);
}

function formatDuracao(ms: number | null | undefined, t: (k: string, v?: Record<string, string | number>) => string): string {
  if (ms == null) return '—';
  if (ms < 1000) return t('modules.jobExecucoesAdmin.durationMs', { n: ms });
  const s = ms / 1000;
  return t('modules.jobExecucoesAdmin.durationSec', { n: Number(s.toFixed(s < 10 ? 2 : 1)) });
}

export function JobExecucoesGrid(props: JobExecucoesGridProps): React.ReactElement {
  const { gridApiRef, filtrosConsultaRef, onDatasourceError, onRowOpen, pageSize } = props;
  const { t } = useTranslation('common');
  const blockSize = resolveJobExecucoesGridBlockSize(pageSize);
  const onErrorRef = useRef(onDatasourceError);
  onErrorRef.current = onDatasourceError;
  const gridSizeFitDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const serverSideDatasource = useMemo<IServerSideDatasource<JobExecucaoGridRow>>(
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
            const f = filtrosConsultaRef.current ?? JOB_EXEC_FILTROS_VAZIO;
            const result = await consultarJobExecucoesGrid({
              startRow: start,
              endRow: end,
              sortModel: request.sortModel ?? [],
              dataInicio: f.dataInicio ? new Date(f.dataInicio).toISOString() : null,
              dataFim: f.dataFim ? new Date(f.dataFim).toISOString() : null,
              jobNome: f.jobNome.trim() ? f.jobNome.trim() : null,
              resultadoFiltro: f.resultado === 'todos' ? null : f.resultado,
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

  const columnDefs = useMemo<ColDef<JobExecucaoGridRow>[]>(
    () => [
      {
        field: 'inicioUtc',
        headerName: t('modules.jobExecucoesAdmin.colStart'),
        flex: 1,
        minWidth: 160,
        valueFormatter: (p) => formatDateTime(p.value as string | undefined),
      },
      {
        field: 'fimUtc',
        headerName: t('modules.jobExecucoesAdmin.colEnd'),
        flex: 1,
        minWidth: 160,
        valueFormatter: (p) => formatDateTime(p.value as string | undefined),
      },
      {
        field: 'duracaoMs',
        headerName: t('modules.jobExecucoesAdmin.colDuration'),
        width: 110,
        valueFormatter: (p) => formatDuracao(p.value as number | null | undefined, t),
      },
      {
        field: 'sucesso',
        headerName: t('modules.jobExecucoesAdmin.colResult'),
        width: 130,
        cellRenderer: (p: { data?: JobExecucaoGridRow }) => {
          const row = p.data;
          if (!row) return null;
          if (row.fimUtc == null || row.fimUtc === '') {
            return (
              <span
                style={{
                  display: 'inline-block',
                  padding: '2px 8px',
                  borderRadius: 6,
                  fontSize: 11,
                  fontWeight: 600,
                  background: '#6f42c1',
                  color: '#fff',
                }}
              >
                {t('modules.jobExecucoesAdmin.badgeRunning')}
              </span>
            );
          }
          if (row.sucesso === true) {
            return (
              <span
                style={{
                  display: 'inline-block',
                  padding: '2px 8px',
                  borderRadius: 6,
                  fontSize: 11,
                  fontWeight: 600,
                  background: '#198754',
                  color: '#fff',
                }}
              >
                {t('modules.jobExecucoesAdmin.badgeOk')}
              </span>
            );
          }
          if (row.sucesso === false) {
            return (
              <span
                style={{
                  display: 'inline-block',
                  padding: '2px 8px',
                  borderRadius: 6,
                  fontSize: 11,
                  fontWeight: 600,
                  background: '#DC3545',
                  color: '#fff',
                }}
              >
                {t('modules.jobExecucoesAdmin.badgeFail')}
              </span>
            );
          }
          return <span className="text-slate-500">—</span>;
        },
      },
      { field: 'jobNome', headerName: t('modules.jobExecucoesAdmin.colJobName'), flex: 1, minWidth: 120 },
      { field: 'jobGrupo', headerName: t('modules.jobExecucoesAdmin.colJobGroup'), width: 120 },
      { field: 'triggerNome', headerName: t('modules.jobExecucoesAdmin.colTriggerName'), flex: 1, minWidth: 140 },
      { field: 'triggerGrupo', headerName: t('modules.jobExecucoesAdmin.colTriggerGroup'), width: 120 },
      {
        field: 'fireInstanceId',
        headerName: t('modules.jobExecucoesAdmin.colFireInstance'),
        flex: 1,
        minWidth: 180,
      },
      { field: 'mensagemErro', headerName: t('modules.jobExecucoesAdmin.colError'), flex: 1, minWidth: 160 },
    ],
    [t]
  );

  const defaultColDef = useMemo<ColDef<JobExecucaoGridRow>>(
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

  const getRowId = useCallback((p: GetRowIdParams<JobExecucaoGridRow>) => String(p.data?.id ?? ''), []);

  const onRowClicked = useCallback(
    (e: RowClickedEvent<JobExecucaoGridRow>) => {
      if (e.data) {
        onRowOpen(e.data);
      }
    },
    [onRowOpen]
  );

  const onGridReady = useCallback((e: GridReadyEvent<JobExecucaoGridRow>) => {
    requestAnimationFrame(() => {
      if (!e.api.isDestroyed()) {
        e.api.sizeColumnsToFit();
      }
    });
  }, []);

  const onFirstDataRendered = useCallback((e: FirstDataRenderedEvent<JobExecucaoGridRow>) => {
    requestAnimationFrame(() => {
      if (!e.api.isDestroyed()) {
        e.api.sizeColumnsToFit();
      }
    });
  }, []);

  const onGridSizeChanged = useCallback((e: GridSizeChangedEvent<JobExecucaoGridRow>) => {
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
      id={JOB_EXEC_GRID_HOST_ID}
      className="produtos-grid-host produtos-grid-host--erp produtos-grid-host--catalog-scroll w-full min-w-0"
    >
      <BaseGrid<JobExecucaoGridRow>
        key={`job-exec-grid-${pageSize}`}
        variant="adminCatalog"
        className="w-full min-w-0"
        gridApiRef={gridApiRef}
        initialState={JOB_EXEC_GRID_INITIAL_STATE}
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
