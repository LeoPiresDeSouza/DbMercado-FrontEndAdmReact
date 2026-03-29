import React, { useCallback, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import type { GridApi } from 'ag-grid-community';
import { usuarioTemModuloProduto } from '../../../shared/constants/produtoModulo';
import { useModulosUsuarioStore } from '../../../shared/stores/modulosUsuarioStore';
import { useNotificationCenterStore } from '../../../shared/stores/notificationCenterStore';
import { resolveLocalizedErrorMessage } from '../../../shared/utils/resolveLocalizedErrorMessage';
import ProdutosGrid, { type ProdutosGridPageSizeOption } from '../components/ProdutosGrid';
import { excluirProduto, type ProdutoGridRow } from '../services/produtoService';

function ProductsListPage(): React.ReactElement {
  const { t } = useTranslation('common');
  const modulos = useModulosUsuarioStore((s) => s.modulos);
  const addNotification = useNotificationCenterStore((s) => s.add);
  const gridApiRef = useRef<GridApi<ProdutoGridRow> | null>(null);
  const [gridPageSize, setGridPageSize] = useState<ProdutosGridPageSizeOption>(20);

  const podeVerProdutos = modulos !== null && usuarioTemModuloProduto(modulos);
  const carregandoModulos = modulos === null;

  const refreshGrid = useCallback(() => {
    gridApiRef.current?.refreshServerSide({ purge: true });
  }, []);

  const handleDatasourceError = useCallback(
    (error: unknown) => {
      addNotification({
        title: t('modules.productsAdmin.loadErrorTitle'),
        body: resolveLocalizedErrorMessage(error, t),
        severity: 'error',
      });
    },
    [addNotification, t]
  );

  const handleExcluirSelecionados = useCallback(async () => {
    const api = gridApiRef.current;
    if (!api) {
      return;
    }
    const selected = api.getSelectedRows().filter((r): r is ProdutoGridRow & { id: number } => !r.isGroup && r.id != null);
    if (selected.length === 0) {
      addNotification({
        title: t('modules.productsAdmin.deleteNoneTitle'),
        body: t('modules.productsAdmin.deleteNoneBody'),
        severity: 'info',
      });
      return;
    }
    try {
      for (const row of selected) {
        await excluirProduto(row.id);
      }
      addNotification({
        title: t('modules.productsAdmin.deleteOkTitle'),
        body: t('modules.productsAdmin.deleteOkBody', { count: selected.length }),
        severity: 'success',
      });
      refreshGrid();
      api.deselectAll();
    } catch (error: unknown) {
      addNotification({
        title: t('modules.productsAdmin.deleteErrorTitle'),
        body: resolveLocalizedErrorMessage(error, t),
        severity: 'error',
      });
      refreshGrid();
    }
  }, [addNotification, refreshGrid, t]);

  if (carregandoModulos) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center px-6 py-16">
        <p className="text-center text-sm text-neutral-600">{t('modules.productsAdmin.loadingModules')}</p>
      </div>
    );
  }

  if (!podeVerProdutos) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center px-6 py-16">
        <p className="max-w-md text-center text-sm text-neutral-600">{t('modules.productsAdmin.noAccess')}</p>
      </div>
    );
  }

  return (
    <div className="flex w-full flex-col pb-8 pt-2">
      <header
        className="mb-4 shrink-0 border-b border-gray-200 pb-4 pt-1"
        aria-label={t('modules.productsAdmin.title')}
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <h1 className="text-lg font-semibold text-gray-900">{t('modules.productsAdmin.toolbarGridTitle')}</h1>
            <p className="mt-1 max-w-2xl text-sm text-gray-600">{t('modules.productsAdmin.subtitleList')}</p>
          </div>
          <div className="flex shrink-0 flex-wrap items-center justify-end gap-2">
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <span className="whitespace-nowrap">{t('modules.productsAdmin.gridPageSizeLabel')}</span>
              <select
                className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                aria-label={t('modules.productsAdmin.gridPageSizeLabel')}
                value={gridPageSize === 'all' ? 'all' : String(gridPageSize)}
                onChange={(e) => {
                  const v = e.target.value;
                  setGridPageSize(v === 'all' ? 'all' : (Number(v) as ProdutosGridPageSizeOption));
                }}
              >
                <option value="10">10</option>
                <option value="20">20</option>
                <option value="50">50</option>
                <option value="70">70</option>
                <option value="100">100</option>
                <option value="all">{t('modules.productsAdmin.gridPageSizeAll')}</option>
              </select>
            </label>
            <button
              type="button"
              className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-800 shadow-sm hover:bg-gray-50"
              onClick={() => refreshGrid()}
            >
              {t('modules.productsAdmin.refresh')}
            </button>
            <button
              type="button"
              className="rounded-md border border-red-200 bg-white px-4 py-2 text-sm font-medium text-red-700 shadow-sm hover:bg-red-50"
              onClick={() => void handleExcluirSelecionados()}
            >
              {t('modules.productsAdmin.deleteSelected')}
            </button>
            <Link
              to="/admin/produtos/novo"
              className="inline-flex items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700"
            >
              {t('modules.productsAdmin.toolbarNewProduct')}
            </Link>
          </div>
        </div>
      </header>

      <section
        className="products-page-grid-bleed flex w-full min-w-0 flex-col overflow-x-auto px-3 pb-2 pt-0 sm:px-4"
        aria-label={t('modules.productsAdmin.gridAria')}
      >
        <ProdutosGrid
          gridApiRef={gridApiRef}
          pageSize={gridPageSize}
          onDatasourceError={handleDatasourceError}
          onPageSizeChange={setGridPageSize}
        />
      </section>
    </div>
  );
}

export default ProductsListPage;
