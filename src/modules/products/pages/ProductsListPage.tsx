import React, { useCallback, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Plus, RefreshCw, Trash2 } from 'lucide-react';
import type { GridApi } from 'ag-grid-community';
import { usuarioTemModuloProduto } from '../../../shared/constants/produtoModulo';
import { useModulosUsuarioStore } from '../../../shared/stores/modulosUsuarioStore';
import { useNotificationCenterStore } from '../../../shared/stores/notificationCenterStore';
import { resolveLocalizedErrorMessage } from '../../../shared/utils/resolveLocalizedErrorMessage';
import ProdutosGrid, { type ProdutosGridPageSizeOption } from '../components/ProdutosGrid';
import { ProdutoDeleteConfirmModal } from '../grid/ProdutoDeleteConfirmModal';
import { excluirProduto, type ProdutoGridRow } from '../services/produtoService';

function ProductsListPage(): React.ReactElement {
  const { t } = useTranslation('common');
  const modulos = useModulosUsuarioStore((s) => s.modulos);
  const addNotification = useNotificationCenterStore((s) => s.add);
  const gridApiRef = useRef<GridApi<ProdutoGridRow> | null>(null);
  const pendingBulkDeleteIdsRef = useRef<number[]>([]);
  const [gridPageSize, setGridPageSize] = useState<ProdutosGridPageSizeOption>(20);
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
  const [bulkDeleting, setBulkDeleting] = useState(false);

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

  const openBulkDeleteConfirm = useCallback(() => {
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
    pendingBulkDeleteIdsRef.current = selected.map((r) => r.id);
    setBulkDeleteOpen(true);
  }, [addNotification, t]);

  const closeBulkDeleteConfirm = useCallback(() => {
    if (bulkDeleting) {
      return;
    }
    setBulkDeleteOpen(false);
    pendingBulkDeleteIdsRef.current = [];
  }, [bulkDeleting]);

  const confirmBulkDelete = useCallback(async () => {
    const api = gridApiRef.current;
    const ids = [...pendingBulkDeleteIdsRef.current];
    if (ids.length === 0 || api == null) {
      return;
    }
    setBulkDeleting(true);
    try {
      for (const id of ids) {
        await excluirProduto(id);
      }
      addNotification({
        title: t('modules.productsAdmin.deleteOkTitle'),
        body: t('modules.productsAdmin.deleteOkBody', { count: ids.length }),
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
    } finally {
      setBulkDeleting(false);
      setBulkDeleteOpen(false);
      pendingBulkDeleteIdsRef.current = [];
    }
  }, [addNotification, refreshGrid, t]);

  if (carregandoModulos) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center px-6 py-16">
        <p className="text-center text-sm text-[#718096]">{t('modules.productsAdmin.loadingModules')}</p>
      </div>
    );
  }

  if (!podeVerProdutos) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center px-6 py-16">
        <p className="max-w-md text-center text-sm text-[#718096]">{t('modules.productsAdmin.noAccess')}</p>
      </div>
    );
  }

  return (
    <div className="flex w-full flex-col pb-8 pt-2">
      <header className="mb-8 shrink-0" aria-label={t('modules.productsAdmin.title')}>
        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <h1 className="text-2xl font-bold text-white">{t('modules.productsAdmin.toolbarGridTitle')}</h1>
            <p className="mt-0.5 max-w-2xl text-sm text-[#718096]">{t('modules.productsAdmin.subtitleList')}</p>
          </div>
          <div className="flex shrink-0 flex-wrap items-center justify-end gap-3">
            <label className="flex items-center gap-2 text-sm text-[#ADB5BD]">
              <span className="whitespace-nowrap">{t('modules.productsAdmin.gridPageSizeLabel')}</span>
              <select
                className="h-10 rounded-md border border-[#2D3748] bg-[#141B2D] px-3 text-sm text-white shadow-sm focus:border-[#0D6EFD] focus:outline-none focus:ring-2 focus:ring-[rgba(13,110,253,0.45)]"
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
              className="inline-flex items-center gap-2 rounded-md border border-[#2D3748] bg-[#141B2D] px-4 py-2 text-sm font-medium text-[#ADB5BD] shadow-sm transition-all hover:border-[#4A5568] hover:text-white focus:outline-none focus:ring-2 focus:ring-[rgba(13,110,253,0.3)]"
              onClick={() => refreshGrid()}
            >
              <RefreshCw size={16} aria-hidden />
              {t('modules.productsAdmin.refresh')}
            </button>
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-md border border-[#DC3545]/30 bg-[#DC3545]/10 px-4 py-2 text-sm font-medium text-[#DC3545] transition-all hover:bg-[#DC3545]/20 focus:outline-none focus:ring-2 focus:ring-[rgba(220,53,69,0.25)]"
              onClick={openBulkDeleteConfirm}
            >
              <Trash2 size={16} aria-hidden />
              {t('modules.productsAdmin.deleteSelected')}
            </button>
            <Link
              to="/admin/produtos/novo"
              className="inline-flex items-center gap-2 rounded-md bg-[#0D6EFD] px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:bg-[#0B5ED7] hover:shadow-md focus:outline-none focus:ring-2 focus:ring-[rgba(13,110,253,0.45)]"
            >
              <Plus size={16} aria-hidden />
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

      <ProdutoDeleteConfirmModal
        open={bulkDeleteOpen}
        variant="bulk"
        confirming={bulkDeleting}
        onClose={closeBulkDeleteConfirm}
        onConfirm={confirmBulkDelete}
      />
    </div>
  );
}

export default ProductsListPage;
