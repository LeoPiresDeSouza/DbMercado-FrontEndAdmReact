import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { SUPPORTED_LANGUAGES, type SupportedLanguage } from '../../i18n/constants';
import { queryClient } from '../../query/queryClient';
import { authService } from '../../../modules/auth/services/authService';
import { useAuthStore } from '../../stores/authStore';
import { useNotificationCenterStore } from '../../stores/notificationCenterStore';
import { useModulosUsuarioStore } from '../../stores/modulosUsuarioStore';
import { usePermissionStore } from '../../stores/permissionStore';
import './AdminTopbar.css';

interface AdminTopbarProps {
  title?: string;
}

function AdminTopbar({ title }: AdminTopbarProps): React.ReactElement {
  const { t, i18n } = useTranslation('common');
  const navigate = useNavigate();
  const tenantId = useAuthStore((s) => s.tenantId);
  const setTenantId = useAuthStore((s) => s.setTenantId);
  const addNotification = useNotificationCenterStore((s) => s.add);
  const unreadCount = useNotificationCenterStore(
    (s) => s.items.filter((n) => !n.readAtUtc).length
  );

  const displayTitle = title ?? t('topbar.titleDefault');

  const handleLogout = () => {
    authService.logout();
    useAuthStore.getState().clearSession();
    usePermissionStore.getState().clear();
    useModulosUsuarioStore.getState().clear();
    useNotificationCenterStore.getState().clear();
    queryClient.clear();
    navigate('/login');
  };

  const handleTenantChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const v = event.target.value;
    setTenantId(v.length > 0 ? v : null);
  };

  const handleLanguageChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const lng = event.target.value as SupportedLanguage;
    void i18n.changeLanguage(lng);
  };

  const handleNotifyDemo = () => {
    addNotification({
      title: t('topbar.notifyDemoTitle'),
      body: t('topbar.notifyDemoBody'),
      severity: 'info',
    });
  };

  return (
    <header className="admin-topbar">
      <h1 className="admin-topbar__title">{displayTitle}</h1>
      <div className="admin-topbar__actions">
        <label className="admin-topbar__tenant-label" htmlFor="admin-tenant">
          <span className="admin-topbar__tenant-text">{t('topbar.scope')}</span>
          <select
            id="admin-tenant"
            className="admin-topbar__tenant-select"
            value={tenantId ?? ''}
            onChange={handleTenantChange}
            aria-label={t('topbar.tenantAria')}
          >
            <option value="">{t('topbar.tenantDefault')}</option>
            <option value="demo-tenant-a">demo-tenant-a</option>
            <option value="demo-tenant-b">demo-tenant-b</option>
          </select>
        </label>
        <label className="admin-topbar__tenant-label" htmlFor="admin-lang">
          <span className="admin-topbar__tenant-text">{t('topbar.language')}</span>
          <select
            id="admin-lang"
            className="admin-topbar__tenant-select"
            value={i18n.language}
            onChange={handleLanguageChange}
            aria-label={t('topbar.language')}
          >
            {SUPPORTED_LANGUAGES.map((lng) => (
              <option key={lng} value={lng}>
                {lng}
              </option>
            ))}
          </select>
        </label>
        <button
          type="button"
          className="admin-topbar__notify"
          onClick={handleNotifyDemo}
          aria-label={t('topbar.notificationsAria')}
        >
          {t('topbar.notificationsBell')}
          {unreadCount > 0 ? <span className="admin-topbar__notify-badge">{unreadCount}</span> : null}
        </button>
        <button type="button" className="admin-topbar__logout" onClick={handleLogout}>
          {t('topbar.logout')}
        </button>
      </div>
    </header>
  );
}

export default AdminTopbar;
