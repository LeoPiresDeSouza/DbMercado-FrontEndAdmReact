import React, { useCallback, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import type { CustomCellRendererProps } from 'ag-grid-react';
import type { ProdutoResumo } from '../services/produtoService';
import { excluirProduto } from '../services/produtoService';
import { useNotificationCenterStore } from '../../../shared/stores/notificationCenterStore';
import { resolveLocalizedErrorMessage } from '../../../shared/utils/resolveLocalizedErrorMessage';

function IconEdit(props: { className?: string }): React.ReactElement {
  return (
    <svg
      className={props.className}
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  );
}

function IconTrash(props: { className?: string }): React.ReactElement {
  return (
    <svg
      className={props.className}
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M3 6h18" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
      <line x1="10" y1="11" x2="10" y2="17" />
      <line x1="14" y1="11" x2="14" y2="17" />
    </svg>
  );
}

export function ProdutoAcoesCell(props: CustomCellRendererProps<ProdutoResumo>): React.ReactElement | null {
  const { t } = useTranslation('common');
  const addNotification = useNotificationCenterStore((s) => s.add);
  const [deleting, setDeleting] = useState(false);
  const deleteBusyRef = useRef(false);
  const id = props.data?.id;
  if (id == null) {
    return null;
  }

  const handleDelete = useCallback(
    async (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (deleteBusyRef.current) {
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
        props.api.refreshInfiniteCache();
      } catch (error: unknown) {
        addNotification({
          title: t('modules.productsAdmin.deleteErrorTitle'),
          body: resolveLocalizedErrorMessage(error, t),
          severity: 'error',
        });
        props.api.refreshInfiniteCache();
      } finally {
        deleteBusyRef.current = false;
        setDeleting(false);
      }
    },
    [addNotification, id, props.api, t]
  );

  return (
    <div className="flex items-center gap-2">
      <Link
        to={`/admin/produtos/${id}`}
        className="inline-flex rounded border-0 bg-transparent p-1 text-blue-600 shadow-none hover:text-blue-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-blue-500"
        aria-label={t('modules.productsAdmin.editLink')}
        onClick={(e) => e.stopPropagation()}
      >
        <IconEdit />
      </Link>
      <button
        type="button"
        disabled={deleting}
        className="inline-flex rounded border-0 bg-transparent p-1 text-red-600 shadow-none hover:text-red-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-red-500 disabled:opacity-50"
        aria-label={t('modules.productsAdmin.deleteRowAria')}
        onClick={(e) => void handleDelete(e)}
      >
        <IconTrash />
      </button>
    </div>
  );
}
