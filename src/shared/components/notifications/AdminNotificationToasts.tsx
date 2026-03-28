import React, { useMemo } from 'react';
import { Toast, type ToastSeverity } from '../../../design-system/components/Toast/Toast';
import { useNotificationCenterStore } from '../../stores/notificationCenterStore';
import './AdminNotificationToasts.css';

function toToastSeverity(s: string | undefined): ToastSeverity {
  if (s === 'success' || s === 'warning' || s === 'error') {
    return s;
  }
  return 'info';
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
        <Toast
          key={n.id}
          title={n.title}
          body={n.body}
          severity={toToastSeverity(n.severity)}
          politeness={n.severity === 'error' ? 'assertive' : 'polite'}
          onDismiss={() => dismiss(n.id)}
          className="admin-notification-toasts__toast"
        />
      ))}
    </div>
  );
}
