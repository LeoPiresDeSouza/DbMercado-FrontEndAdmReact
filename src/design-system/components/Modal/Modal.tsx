import React, { useEffect, useId } from 'react';
import { createPortal } from 'react-dom';
import { Button } from '../Button/Button';
import './Modal.css';

export type ModalSize = 'sm' | 'md' | 'lg';

export interface ModalProps {
  open: boolean;
  title?: string;
  onClose: () => void;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: ModalSize;
}

export function Modal({
  open,
  title,
  onClose,
  children,
  footer,
  size = 'md',
}: ModalProps): React.ReactElement | null {
  const titleId = useId();

  useEffect(() => {
    if (!open) {
      return;
    }
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  useEffect(() => {
    if (!open) {
      return;
    }
    const onKey = (e: KeyboardEvent): void => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) {
    return null;
  }

  return createPortal(
    <div className="ds-modal-root" role="presentation">
      <button
        type="button"
        className="ds-modal__backdrop"
        aria-label="Fechar modal"
        onClick={onClose}
      />
      <div
        className={`ds-modal ds-modal--${size}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
      >
        <header className="ds-modal__header">
          {title ? (
            <h2 className="ds-modal__title" id={titleId}>
              {title}
            </h2>
          ) : null}
          <Button variant="ghost" size="sm" className="ds-modal__close" onClick={onClose} aria-label="Fechar">
            ×
          </Button>
        </header>
        <div className="ds-modal__body">{children}</div>
        {footer ? <footer className="ds-modal__footer">{footer}</footer> : null}
      </div>
    </div>,
    document.body
  );
}
