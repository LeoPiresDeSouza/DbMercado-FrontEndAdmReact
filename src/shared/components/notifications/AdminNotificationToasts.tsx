import React, { useEffect, useMemo } from 'react';
import { Toast, type ToastSeverity } from '../../../design-system/components/Toast/Toast';
import type { AdminNotificationItem } from '../../stores/notificationCenterStore';
import { useNotificationCenterStore } from '../../stores/notificationCenterStore';
import './AdminNotificationToasts.css';

/** Erros permanecem visíveis mais tempo para leitura do detalhe. */
const TOAST_AUTO_DISMISS_MS_ERROR = 10_000;
const TOAST_AUTO_DISMISS_MS_DEFAULT = 5_000;

function toastAutoDismissMs(severity: string | undefined): number {
  return severity === 'error' ? TOAST_AUTO_DISMISS_MS_ERROR : TOAST_AUTO_DISMISS_MS_DEFAULT;
}

function toToastSeverity(s: string | undefined): ToastSeverity {
  if (s === 'success' || s === 'warning' || s === 'error') {
    return s;
  }
  return 'info';
}

function AdminNotificationToastRow(props: {
  item: AdminNotificationItem;
  dismiss: (id: string) => void;
}): React.ReactElement {
  const { item: n, dismiss } = props;

  useEffect(() => {
    const ms = toastAutoDismissMs(n.severity);
    const handle = window.setTimeout(() => dismiss(n.id), ms);
    return () => window.clearTimeout(handle);
  }, [dismiss, n.id, n.severity]);

  return (
    <Toast
      title={n.title}
      body={n.body}
      severity={toToastSeverity(n.severity)}
      politeness={n.severity === 'error' ? 'assertive' : 'polite'}
      onDismiss={() => dismiss(n.id)}
      className="admin-notification-toasts__toast"
    />
  );
}

/**
 * Pilha de notificações (Zustand) usando o Toast do design system.
 */
export function AdminNotificationToasts(): React.ReactElement {
  // Não use .slice no seletor: retorna array novo a cada leitura → Zustand vê “mudança” eterna → loop de render.
  const allItems = useNotificationCenterStore((s) => s.items);
  const items = useMemo(() => allItems.slice(0, 5), [allItems]);
  const dismiss = useNotificationCenterStore((s) => s.dismiss);

  if (items.length === 0) {
    return <></>;
  }

  return (
    <div className="admin-notification-toasts" aria-live="polite">
      {items.map((n) => (
        <AdminNotificationToastRow key={n.id} item={n} dismiss={dismiss} />
      ))}
    </div>
  );
}
