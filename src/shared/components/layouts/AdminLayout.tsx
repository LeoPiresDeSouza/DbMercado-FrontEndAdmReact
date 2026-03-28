import React from 'react';
import { useTranslation } from 'react-i18next';
import { Outlet } from 'react-router-dom';
import { AdminNotificationToasts } from '../notifications/AdminNotificationToasts';
import { useAppShellStore } from '../../stores/appShellStore';
import AdminSidebar from './AdminSidebar';
import AdminTopbar from './AdminTopbar';
import AdminBreadcrumb from './AdminBreadcrumb';
import './AdminLayout.css';

/**
 * Shell administrativo: sidebar + topbar + breadcrumb + área de conteúdo (Outlet).
 */
function AdminLayout(): React.ReactElement {
  const { t } = useTranslation('common');
  const collapsed = useAppShellStore((s) => s.sidebarCollapsed);
  const mobileOpen = useAppShellStore((s) => s.mobileSidebarOpen);
  const toggleMobileSidebar = useAppShellStore((s) => s.toggleMobileSidebar);
  const setMobileOpen = useAppShellStore((s) => s.setMobileSidebarOpen);

  return (
    <div className={`admin-shell${collapsed ? ' admin-shell--sidebar-collapsed' : ''}`}>
      <button
        type="button"
        className="admin-shell__menu-fab"
        aria-label={t('shell.openMenuFab')}
        onClick={toggleMobileSidebar}
      >
        {t('shell.menuFab')}
      </button>

      {mobileOpen ? (
        <button
          type="button"
          className="admin-shell__backdrop"
          aria-label={t('shell.backdropClose')}
          onClick={() => setMobileOpen(false)}
        />
      ) : null}

      <AdminSidebar />
      <div className="admin-main">
        <AdminTopbar />
        <AdminBreadcrumb />
        <main className="admin-content">
          <Outlet />
        </main>
      </div>
      <AdminNotificationToasts />
    </div>
  );
}

export default AdminLayout;
