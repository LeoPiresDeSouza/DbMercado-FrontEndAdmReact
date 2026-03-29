import type { FirstDataRenderedEvent, GridApi, GridReadyEvent } from 'ag-grid-community';
import { useCallback, useEffect, useRef } from 'react';
import type { ProdutoGridRow } from '../services/produtoService';

/** Tablet: exibe coluna de menor prioridade (marca). */
const VIEWPORT_MD = 768;
/** Mobile estreito: oculta unidade; mantém nome + ações + scroll horizontal. */
const VIEWPORT_SM = 520;

const COL_MARCA = 'marca';
const COL_UNIDADE = 'unidadeMedida';

function applyVisibility(api: GridApi<ProdutoGridRow>): void {
  const w = window.innerWidth;
  const showMarca = w >= VIEWPORT_MD;
  const showUnidade = w >= VIEWPORT_SM;
  api.setColumnsVisible([COL_MARCA], showMarca);
  api.setColumnsVisible([COL_UNIDADE], showUnidade);
}

/**
 * Visibilidade por breakpoint + encaixe de larguras (`gridOptions.autoSizeStrategy` = fitGridWidth).
 */
export function applyProdutoGridResponsiveLayout(api: GridApi<ProdutoGridRow>): void {
  applyVisibility(api);
  if (!api.isDestroyed()) {
    api.sizeColumnsToFit();
  }
}

/**
 * Reaplica layout em resize (debounce) e após o grid estar pronto / primeira renderização de dados.
 */
export function useProdutoGridResponsiveLayout(): {
  onGridReady: (e: GridReadyEvent<ProdutoGridRow>) => void;
  onFirstDataRendered: (e: FirstDataRenderedEvent<ProdutoGridRow>) => void;
} {
  const apiRef = useRef<GridApi<ProdutoGridRow> | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const scheduleLayout = useCallback(() => {
    const api = apiRef.current;
    if (!api || api.isDestroyed()) {
      return;
    }
    applyProdutoGridResponsiveLayout(api);
  }, []);

  const onResize = useCallback(() => {
    if (debounceRef.current != null) {
      clearTimeout(debounceRef.current);
    }
    debounceRef.current = setTimeout(() => {
      debounceRef.current = null;
      scheduleLayout();
    }, 160);
  }, [scheduleLayout]);

  useEffect(() => {
    window.addEventListener('resize', onResize);
    return () => {
      window.removeEventListener('resize', onResize);
      if (debounceRef.current != null) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [onResize]);

  const onGridReady = useCallback(
    (e: GridReadyEvent<ProdutoGridRow>) => {
      apiRef.current = e.api;
      applyProdutoGridResponsiveLayout(e.api);
    },
    []
  );

  const onFirstDataRendered = useCallback((e: FirstDataRenderedEvent<ProdutoGridRow>) => {
    apiRef.current = e.api;
    applyProdutoGridResponsiveLayout(e.api);
  }, []);

  return { onGridReady, onFirstDataRendered };
}
