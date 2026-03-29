import React, { useCallback, useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import type { ColDef, GridApi, IGetRowsParams, PaginationChangedEvent } from 'ag-grid-community';
import { BaseGrid } from '../../../shared/components/grid';
import { authService } from '../../auth/services/authService';
import { createProdutoGridColumnDefs } from '../grid/produtoGridColDefs';
import { consultarProdutosGrid, type ProdutoResumo } from '../services/produtoService';

/** Bloco do infinite row model ao exibir “todos” (limite superior da requisição ao servidor). */
const PRODUTOS_GRID_BLOCK_SIZE_ALL = 250_000;

export type ProdutosGridPageSizeOption = 10 | 20 | 50 | 70 | 100 | 'all';

const PAGE_SIZE_SELECTOR_VALUES: Array<10 | 20 | 50 | 70 | 100> = [10, 20, 50, 70, 100];

export function resolveProdutosGridBlockSize(option: ProdutosGridPageSizeOption): number {
  return option === 'all' ? PRODUTOS_GRID_BLOCK_SIZE_ALL : option;
}

export type ProdutosGridProps = {
  gridApiRef: React.RefObject<GridApi<ProdutoResumo> | null>;
  /** Erro ao carregar bloco (ex.: notificação + i18n na página). */
  onDatasourceError?: (error: unknown) => void;
  className?: string;
  /** Quantidade de linhas por página (paginação + tamanho do bloco no infinite row model). */
  pageSize: ProdutosGridPageSizeOption;
  /** Sincroniza estado ao mudar o tamanho da página pelo seletor do rodapé do AG Grid. */
  onPageSizeChange?: (size: ProdutosGridPageSizeOption) => void;
};

/**
 * Grid de catálogo de produtos: colunas + datasource contra `consultarProdutosGrid`.
 */
function ProdutosGrid(props: ProdutosGridProps): React.ReactElement {
  const { gridApiRef, onDatasourceError, className, pageSize, onPageSizeChange } = props;
  const { t } = useTranslation('common');

  const onDatasourceErrorRef = useRef(onDatasourceError);
  onDatasourceErrorRef.current = onDatasourceError;

  const getRows = useCallback((params: IGetRowsParams<ProdutoResumo>) => {
    if (!authService.isAuthenticated()) {
      params.failCallback();
      return;
    }

    void (async () => {
      try {
        const filterModel = params.filterModel as Record<string, unknown> | null | undefined;
        const hasFilters = filterModel && Object.keys(filterModel).length > 0;
        const result = await consultarProdutosGrid({
          startRow: params.startRow,
          endRow: params.endRow,
          sortModel: params.sortModel ?? [],
          filterModel: hasFilters ? filterModel : null,
        });
        params.successCallback(result.rows, result.rowCount);
      } catch (error: unknown) {
        onDatasourceErrorRef.current?.(error);
        params.failCallback();
      }
    })();
  }, []);

  const datasource = useMemo(() => ({ getRows }), [getRows]);

  const columnDefs = useMemo(
    () => createProdutoGridColumnDefs({ acoesHeader: t('modules.productsAdmin.columnAcoes') }),
    [t]
  );

  const defaultColDef = useMemo<ColDef<ProdutoResumo>>(
    () => ({
      headerClass: 'text-xs font-semibold uppercase tracking-wide text-gray-500',
      cellClass: 'text-sm text-gray-900',
    }),
    []
  );

  const selectionColumnDef = useMemo(
    () => ({
      width: 50,
      headerClass: 'text-xs font-semibold uppercase tracking-wide text-gray-500',
      suppressHeaderMenuButton: true,
    }),
    []
  );

  const blockSize = resolveProdutosGridBlockSize(pageSize);
  const maxBlocksInCache = pageSize === 'all' ? 1 : 20;

  const paginationLocale = useMemo(
    () => ({
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
    (event: PaginationChangedEvent<ProdutoResumo>) => {
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

  const showAgPageSizeSelector = pageSize !== 'all';

  return (
    <div className={`produtos-grid-host w-full ${className ?? ''}`}>
      <BaseGrid<ProdutoResumo>
        key={`produtos-grid-${pageSize}`}
        gridApiRef={gridApiRef}
        columnDefs={columnDefs}
        defaultColDef={defaultColDef}
        selectionColumnDef={selectionColumnDef}
        rowModelType="infinite"
        datasource={datasource}
        getRowId={(p) => String(p.data?.id ?? '')}
        rowHeight={44}
        headerHeight={40}
        domLayout="autoHeight"
        pagination
        paginationPageSize={blockSize}
        paginationPageSizeSelector={showAgPageSizeSelector ? PAGE_SIZE_SELECTOR_VALUES : false}
        cacheBlockSize={blockSize}
        maxBlocksInCache={maxBlocksInCache}
        localeText={paginationLocale}
        onPaginationChanged={handlePaginationChanged}
      />
    </div>
  );
}

export default ProdutosGrid;
