import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { tryLoadModulosUsuario } from '../../../modules/auth/services/moduloUsuarioService';
import { authService } from '../../../modules/auth/services/authService';
import { performClientLogoutCleanup } from '../../auth/clientSessionCleanup';
import { AdminNotificationToasts } from '../notifications/AdminNotificationToasts';
import { useAppShellStore } from '../../stores/appShellStore';
import { useAuthStore } from '../../stores/authStore';
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
  const navigate = useNavigate();
  const collapsed = useAppShellStore((s) => s.sidebarCollapsed);
  const mobileOpen = useAppShellStore((s) => s.mobileSidebarOpen);
  const toggleMobileSidebar = useAppShellStore((s) => s.toggleMobileSidebar);
  const setMobileOpen = useAppShellStore((s) => s.setMobileSidebarOpen);
  const setSidebarCollapsed = useAppShellStore((s) => s.setSidebarCollapsed);
  const sessionRevision = useAuthStore((s) => s.sessionRevision);

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
    const { setModulos } = useModulosUsuarioStore.getState();
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
  }, [sessionRevision]);

  /** Ao voltar à aba, revalida com o servidor (refresh revogado / expirado no back-end). */
  useEffect(() => {
    const onVisibility = (): void => {
      if (document.visibilityState !== 'visible') {
        return;
      }
      void (async () => {
        if (!authService.isAuthenticated()) {
          performClientLogoutCleanup();
          navigate('/login', { replace: true });
          return;
        }
        const ok = await authService.validateSessionWithServer();
        if (!ok) {
          performClientLogoutCleanup();
          navigate('/login', { replace: true });
        }
      })();
    };
    document.addEventListener('visibilitychange', onVisibility);
    return () => document.removeEventListener('visibilitychange', onVisibility);
  }, [navigate]);

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
