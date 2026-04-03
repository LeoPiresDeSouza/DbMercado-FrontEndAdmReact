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

const ICON = 15;
const iconClass = 'h-[15px] w-[15px] shrink-0';

export function ProdutoAcoesCell(props: CustomCellRendererProps<ProdutoGridRow>): React.ReactElement | null {
  const { t } = useTranslation('common');
  const addNotification = useNotificationCenterStore((s) => s.add);
  const [deleting, setDeleting] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const deleteBusyRef = useRef(false);
  const row = props.data;
  const id = row?.id ?? null;
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
    <div className="produto-acoes-cell-inner flex items-center justify-center gap-1">
      <Link
        to={`/admin/produtos/${id}`}
        className="rounded-md border-0 bg-transparent p-1.5 text-[#0D6EFD] shadow-none transition-colors hover:bg-[#0D6EFD]/10 focus:outline-none focus:ring-2 focus:ring-[rgba(13,110,253,0.45)] focus:ring-offset-0"
        aria-label={t('modules.productsAdmin.editLink')}
        title={t('modules.productsAdmin.editLink')}
        onClick={(e) => e.stopPropagation()}
      >
        <Pencil size={ICON} className={iconClass} aria-hidden strokeWidth={2} />
      </Link>
      <button
        type="button"
        disabled={deleting}
        className="rounded-md border-0 bg-transparent p-1.5 text-[#DC3545] shadow-none transition-colors hover:bg-[#DC3545]/10 focus:outline-none focus:ring-2 focus:ring-[rgba(220,53,69,0.35)] focus:ring-offset-0 disabled:opacity-50"
        aria-label={t('modules.productsAdmin.deleteRowAria')}
        title={t('modules.productsAdmin.deleteRowAria')}
        onClick={openDeleteConfirm}
      >
        <Trash2 size={ICON} className={iconClass} aria-hidden strokeWidth={2} />
      </button>
    </div>
    <ProdutoDeleteConfirmModal
      open={deleteConfirmOpen}
      variant="single"
      confirming={deleting}
      onClose={closeDeleteConfirm}
      onConfirm={executeDelete}
    />
    </>
  );
}
