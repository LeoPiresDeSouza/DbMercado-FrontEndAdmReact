import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Outlet, useLocation } from 'react-router-dom';
import { tryLoadModulosUsuario } from '../../../modules/auth/services/moduloUsuarioService';
import { authService } from '../../../modules/auth/services/authService';
import { AdminNotificationToasts } from '../notifications/AdminNotificationToasts';
import { useAppShellStore } from '../../stores/appShellStore';
import { useModulosUsuarioStore } from '../../stores/modulosUsuarioStore';
import { readIdentityFromAccessToken } from '../../utils/jwtPayload';
import AdminSidebar from './AdminSidebar';
import AdminTopbar from './AdminTopbar';
import AdminBreadcrumb from './AdminBreadcrumb';
import './AdminLayout.css';

/**
 * Shell administrativo: sidebar + topbar + breadcrumb + área de conteúdo (Outlet).
 */
function AdminLayout(): React.ReactElement {
  const { t } = useTranslation('common');
  const location = useLocation();
  const collapsed = useAppShellStore((s) => s.sidebarCollapsed);
  const mobileOpen = useAppShellStore((s) => s.mobileSidebarOpen);
  const toggleMobileSidebar = useAppShellStore((s) => s.toggleMobileSidebar);
  const setMobileOpen = useAppShellStore((s) => s.setMobileSidebarOpen);
  const setSidebarCollapsed = useAppShellStore((s) => s.setSidebarCollapsed);

  useEffect(() => {
    setSidebarCollapsed(true);
  }, [location.pathname, setSidebarCollapsed]);

  useEffect(() => {
    const token = authService.getAuthToken();
    const identity = readIdentityFromAccessToken(token);
    if (!identity) {
      useModulosUsuarioStore.getState().markLoadedEmpty();
      return;
    }
    const { modulos, setModulos } = useModulosUsuarioStore.getState();
    if (modulos !== null) {
      return;
    }
    let cancelled = false;
    void tryLoadModulosUsuario(identity)
      .then((list) => {
        if (!cancelled) {
          setModulos(list);
        }
      })
      .catch(() => {
        if (!cancelled) {
          useModulosUsuarioStore.getState().markLoadedEmpty();
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

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
