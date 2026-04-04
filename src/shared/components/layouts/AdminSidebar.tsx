import React from 'react';
import { useTranslation } from 'react-i18next';
import { NavLink } from 'react-router-dom';
import { usuarioTemModuloProduto } from '../../constants/produtoModulo';
import {
  ControleLogsPermissao,
  usuarioTemPermissaoControleLogs,
} from '../../../modules/logs/utils/controleLogsPermissoes';
import {
  JobExecucoesPermissao,
  usuarioTemPermissaoJobExecucoes,
} from '../../../modules/jobExecucoes/utils/controleJobExecucoesPermissoes';
import { useAppShellStore } from '../../stores/appShellStore';
import { useModulosUsuarioStore } from '../../stores/modulosUsuarioStore';
import './AdminSidebar.css';

const navClass = ({ isActive }: { isActive: boolean }): string =>
  `admin-sidebar__link${isActive ? ' admin-sidebar__link--active' : ''}`;

function AdminSidebar(): React.ReactElement {
  const { t } = useTranslation('common');
  const collapsed = useAppShellStore((s) => s.sidebarCollapsed);
  const mobileOpen = useAppShellStore((s) => s.mobileSidebarOpen);
  const toggleCollapsed = useAppShellStore((s) => s.toggleSidebarCollapsed);
  const setMobileOpen = useAppShellStore((s) => s.setMobileSidebarOpen);
  const modulosUsuario = useModulosUsuarioStore((s) => s.modulos);
  const exibirMenuProdutos = modulosUsuario !== null && usuarioTemModuloProduto(modulosUsuario);
  const exibirMenuLogs =
    modulosUsuario !== null && usuarioTemPermissaoControleLogs(modulosUsuario, ControleLogsPermissao.acessar);
  const exibirMenuJobExecucoes =
    modulosUsuario !== null && usuarioTemPermissaoJobExecucoes(modulosUsuario, JobExecucoesPermissao.acessar);

  return (
    <aside
      className={`admin-sidebar${collapsed ? ' admin-sidebar--collapsed' : ''}${mobileOpen ? ' admin-sidebar--open' : ''}`}
      aria-label={t('shell.mainNavAria')}
    >
      <div className="admin-sidebar__toolbar">
        <button
          type="button"
          className="admin-sidebar__icon-btn"
          onClick={toggleCollapsed}
          aria-pressed={collapsed}
          aria-label={collapsed ? t('shell.expandSidebar') : t('shell.collapseSidebar')}
        >
          {collapsed ? '»' : '«'}
        </button>
        <button
          type="button"
          className="admin-sidebar__icon-btn admin-sidebar__icon-btn--mobile"
          onClick={() => setMobileOpen(false)}
          aria-label={t('shell.closeMenu')}
        >
          ✕
        </button>
      </div>

      <div className="admin-sidebar__brand">
        <span className="admin-sidebar__brand-title">
          <span className="admin-sidebar__brand-text">DBMercado</span>
        </span>
        <span className="admin-sidebar__brand-sub">{t('app.admin')}</span>
      </div>

      <nav className="admin-sidebar__nav">
        <div className="admin-sidebar__section-label">{t('nav.sectionMain')}</div>
        <NavLink
          to="/admin/dashboard"
          className={navClass}
          end
          title={t('nav.dashboard')}
          data-sidebar-glyph="▣"
          onClick={() => setMobileOpen(false)}
        >
          <span className="admin-sidebar__link-text">{t('nav.dashboard')}</span>
        </NavLink>

        <div className="admin-sidebar__section-label">{t('nav.sectionGov')}</div>
        <NavLink
          to="/admin/users"
          className={navClass}
          title={t('nav.users')}
          data-sidebar-glyph="◉"
          onClick={() => setMobileOpen(false)}
        >
          <span className="admin-sidebar__link-text">{t('nav.users')}</span>
        </NavLink>
        <NavLink
          to="/admin/roles"
          className={navClass}
          title={t('nav.roles')}
          data-sidebar-glyph="◈"
          onClick={() => setMobileOpen(false)}
        >
          <span className="admin-sidebar__link-text">{t('nav.roles')}</span>
        </NavLink>
        <NavLink
          to="/admin/audit"
          className={navClass}
          title={t('nav.audit')}
          data-sidebar-glyph="◐"
          onClick={() => setMobileOpen(false)}
        >
          <span className="admin-sidebar__link-text">{t('nav.audit')}</span>
        </NavLink>
        {exibirMenuLogs ? (
          <NavLink
            to="/admin/logs"
            className={navClass}
            title={t('nav.logs')}
            data-sidebar-glyph="◎"
            onClick={() => setMobileOpen(false)}
          >
            <span className="admin-sidebar__link-text">{t('nav.logs')}</span>
          </NavLink>
        ) : null}
        {exibirMenuJobExecucoes ? (
          <NavLink
            to="/admin/job-execucoes"
            className={navClass}
            title={t('nav.jobExecucoes')}
            data-sidebar-glyph="⏱"
            onClick={() => setMobileOpen(false)}
          >
            <span className="admin-sidebar__link-text">{t('nav.jobExecucoes')}</span>
          </NavLink>
        ) : null}

        <div className="admin-sidebar__section-label">{t('nav.sectionOps')}</div>
        {exibirMenuProdutos ? (
          <NavLink
            to="/admin/produtos"
            className={navClass}
            title={t('nav.products')}
            data-sidebar-glyph="▪"
            onClick={() => setMobileOpen(false)}
          >
            <span className="admin-sidebar__link-text">{t('nav.products')}</span>
          </NavLink>
        ) : null}
        <NavLink
          to="/admin/orders"
          className={navClass}
          title={t('nav.orders')}
          data-sidebar-glyph="▬"
          onClick={() => setMobileOpen(false)}
        >
          <span className="admin-sidebar__link-text">{t('nav.orders')}</span>
        </NavLink>
        <NavLink
          to="/admin/inventory"
          className={navClass}
          title={t('nav.inventory')}
          data-sidebar-glyph="▭"
          onClick={() => setMobileOpen(false)}
        >
          <span className="admin-sidebar__link-text">{t('nav.inventory')}</span>
        </NavLink>
        <NavLink
          to="/admin/billing"
          className={navClass}
          title={t('nav.billing')}
          data-sidebar-glyph="▮"
          onClick={() => setMobileOpen(false)}
        >
          <span className="admin-sidebar__link-text">{t('nav.billing')}</span>
        </NavLink>
      </nav>
    </aside>
  );
}

export default AdminSidebar;
