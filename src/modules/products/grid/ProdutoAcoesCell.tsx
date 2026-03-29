import React, { useCallback, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Pencil, Trash2 } from 'lucide-react';
import type { CustomCellRendererProps } from 'ag-grid-react';
import type { ProdutoGridRow } from '../services/produtoService';
import { excluirProduto } from '../services/produtoService';
import { useNotificationCenterStore } from '../../../shared/stores/notificationCenterStore';
import { resolveLocalizedErrorMessage } from '../../../shared/utils/resolveLocalizedErrorMessage';
import { ProdutoDeleteConfirmModal } from './ProdutoDeleteConfirmModal';

const ICON = 16;
const iconClass = 'h-4 w-4 shrink-0';

export function ProdutoAcoesCell(props: CustomCellRendererProps<ProdutoGridRow>): React.ReactElement | null {
  const { t } = useTranslation('common');
  const addNotification = useNotificationCenterStore((s) => s.add);
  const [deleting, setDeleting] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const deleteBusyRef = useRef(false);
  const row = props.data;
  const id = row?.id ?? null;
  const productName = row?.nome ?? '';

  const closeDeleteConfirm = useCallback(() => {
    if (deleteBusyRef.current) {
      return;
    }
    setDeleteConfirmOpen(false);
  }, []);

  const executeDelete = useCallback(async () => {
    if (id == null || deleteBusyRef.current) {
      return;
    }
    deleteBusyRef.current = true;
    setDeleting(true);
    try {
      await excluirProduto(id);
      addNotification({
        title: t('modules.productsAdmin.deleteOkTitle'),
        body: t('modules.productsAdmin.deleteOkBody', { count: 1 }),
        severity: 'success',
      });
      setDeleteConfirmOpen(false);
      props.api.refreshServerSide({ purge: true });
    } catch (error: unknown) {
      addNotification({
        title: t('modules.productsAdmin.deleteErrorTitle'),
        body: resolveLocalizedErrorMessage(error, t),
        severity: 'error',
      });
      props.api.refreshServerSide({ purge: true });
    } finally {
      deleteBusyRef.current = false;
      setDeleting(false);
    }
  }, [addNotification, id, props.api, t]);

  const openDeleteConfirm = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (deleteBusyRef.current || id == null) {
      return;
    }
    setDeleteConfirmOpen(true);
  }, [id]);

  if (row == null || row.isGroup || id == null) {
    return null;
  }

  return (
    <>
    <div className="flex items-center justify-center gap-1">
      <Link
        to={`/admin/produtos/${id}`}
        className="inline-flex rounded border-0 bg-transparent p-1.5 text-blue-600 shadow-none hover:text-blue-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-blue-500"
        aria-label={t('modules.productsAdmin.editLink')}
        title={t('modules.productsAdmin.editLink')}
        onClick={(e) => e.stopPropagation()}
      >
        <Pencil size={ICON} className={iconClass} aria-hidden strokeWidth={2} />
      </Link>
      <button
        type="button"
        disabled={deleting}
        className="inline-flex rounded border-0 bg-transparent p-1.5 text-red-600 shadow-none hover:text-red-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-red-500 disabled:opacity-50"
        aria-label={t('modules.productsAdmin.deleteRowAria')}
        title={t('modules.productsAdmin.deleteRowAria')}
        onClick={openDeleteConfirm}
      >
        <Trash2 size={ICON} className={iconClass} aria-hidden strokeWidth={2} />
      </button>
    </div>
    <ProdutoDeleteConfirmModal
      open={deleteConfirmOpen}
      productId={id}
      productName={productName}
      confirming={deleting}
      onClose={closeDeleteConfirm}
      onConfirm={executeDelete}
    />
    </>
  );
}
