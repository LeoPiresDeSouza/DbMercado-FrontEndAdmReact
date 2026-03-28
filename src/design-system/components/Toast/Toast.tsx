import React from 'react';
import './Toast.css';

export type ToastSeverity = 'info' | 'success' | 'warning' | 'error';

export interface ToastProps {
  title: string;
  body?: string;
  severity?: ToastSeverity;
  onDismiss?: () => void;
  /** Ex.: aria-live="assertive" para erros críticos */
  politeness?: 'polite' | 'assertive';
  className?: string;
}

export function Toast({
  title,
  body,
  severity = 'info',
  onDismiss,
  politeness = 'polite',
  className = '',
}: ToastProps): React.ReactElement {
  return (
    <div
      className={`ds-toast ds-toast--${severity} ${className}`.trim()}
      role="status"
      aria-live={politeness}
    >
      <div className="ds-toast__content">
        <strong className="ds-toast__title">{title}</strong>
        {body ? <p className="ds-toast__body">{body}</p> : null}
      </div>
      {onDismiss ? (
        <button type="button" className="ds-toast__dismiss" onClick={onDismiss} aria-label="Dispensar">
          ×
        </button>
      ) : null}
    </div>
  );
}
