import React from 'react';
import { useTranslation } from 'react-i18next';
import { TriangleAlert } from 'lucide-react';
import { Modal } from '../../../design-system/components/Modal/Modal';
import { Button } from '../../../design-system/components/Button/Button';

export type ProdutoDeleteConfirmVariant = 'single' | 'bulk';

export type ProdutoDeleteConfirmModalProps = {
  open: boolean;
  variant: ProdutoDeleteConfirmVariant;
  confirming: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
};

/**
 * Confirmação de exclusão (uma linha ou várias): mensagem genérica, sem nome de produto.
 */
export function ProdutoDeleteConfirmModal(props: ProdutoDeleteConfirmModalProps): React.ReactElement | null {
  const { open, variant, confirming, onClose, onConfirm } = props;
  const { t } = useTranslation('common');

  const titleKey =
    variant === 'bulk'
      ? 'modules.productsAdmin.deleteConfirmTitleBulk'
      : 'modules.productsAdmin.deleteConfirmTitle';
  const leadKey =
    variant === 'bulk'
      ? 'modules.productsAdmin.deleteConfirmLeadBulk'
      : 'modules.productsAdmin.deleteConfirmLeadSingle';

  return (
    <Modal
      open={open}
      title={t(titleKey)}
      titleClassName="!text-amber-600 dark:!text-amber-400"
      onClose={onClose}
      size="sm"
      bodyClassName="!pt-3"
      footer={
        <>
          <Button type="button" variant="secondary" size="md" disabled={confirming} onClick={onClose}>
            {t('modules.productsAdmin.deleteConfirmCancel')}
          </Button>
          <Button
            type="button"
            variant="primary"
            size="md"
            loading={confirming}
            className="!border-amber-600 !bg-amber-600 !text-white hover:!bg-amber-700 hover:!border-amber-700 focus-visible:!outline-amber-500"
            onClick={() => void onConfirm()}
          >
            {t('modules.productsAdmin.deleteConfirmConfirm')}
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <div
          className="flex gap-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4 shadow-sm dark:border-neutral-700 dark:bg-neutral-900/40"
          style={{ boxShadow: 'inset 0 0 0 1px rgba(251, 191, 36, 0.12)' }}
        >
          <div
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-600 dark:bg-amber-950/80 dark:text-amber-400"
            aria-hidden
          >
            <TriangleAlert className="h-6 w-6" strokeWidth={2.25} />
          </div>
          <div className="min-w-0 flex-1 space-y-2">
            <p className="text-[0.9375rem] font-semibold leading-snug text-blue-800 dark:text-blue-200">
              {t(leadKey)}
            </p>
            <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400">
              {t('modules.productsAdmin.deleteConfirmBody')}
            </p>
          </div>
        </div>
        <p className="text-xs text-amber-700/90 dark:text-amber-400/90">
          {t('modules.productsAdmin.deleteConfirmWarning')}
        </p>
      </div>
    </Modal>
  );
}
