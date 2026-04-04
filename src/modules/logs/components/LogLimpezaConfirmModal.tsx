import React from 'react';
import { useTranslation } from 'react-i18next';
import { TriangleAlert } from 'lucide-react';
import { Modal } from '../../../design-system/components/Modal/Modal';
import { Button } from '../../../design-system/components/Button/Button';

export type LogLimpezaConfirmModalProps = {
  open: boolean;
  confirming: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
};

export function LogLimpezaConfirmModal(props: LogLimpezaConfirmModalProps): React.ReactElement | null {
  const { open, confirming, onClose, onConfirm } = props;
  const { t } = useTranslation('common');

  return (
    <Modal
      open={open}
      title={t('modules.logsAdmin.limpezaConfirmTitle')}
      titleClassName="!text-amber-600 dark:!text-amber-400"
      onClose={onClose}
      size="sm"
      bodyClassName="!pt-3"
      footer={
        <>
          <Button type="button" variant="secondary" size="md" disabled={confirming} onClick={onClose}>
            {t('modules.logsAdmin.limpezaConfirmCancel')}
          </Button>
          <Button
            type="button"
            variant="primary"
            size="md"
            loading={confirming}
            className="!border-amber-600 !bg-amber-600 !text-white hover:!bg-amber-700"
            onClick={() => void onConfirm()}
          >
            {t('modules.logsAdmin.limpezaConfirmOk')}
          </Button>
        </>
      }
    >
      <div className="flex gap-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4 dark:border-neutral-700 dark:bg-neutral-900/40">
        <div
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-600 dark:bg-amber-950/80 dark:text-amber-400"
          aria-hidden
        >
          <TriangleAlert className="h-6 w-6" strokeWidth={2.25} />
        </div>
        <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">
          {t('modules.logsAdmin.limpezaConfirmBody')}
        </p>
      </div>
    </Modal>
  );
}
