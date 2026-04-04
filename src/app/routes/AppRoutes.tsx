import React, { useEffect, useState } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import PrivateRoute from '../../shared/components/guards/PrivateRoute';
import AdminLayout from '../../shared/components/layouts/AdminLayout';
import LoginPage from '../../modules/auth/pages/LoginPage';
import DashboardPage from '../../modules/dashboard/pages/DashboardPage';
import UsersPage from '../../modules/users/pages/UsersPage';
import RolesPage from '../../modules/roles/pages/RolesPage';
import AuditPage from '../../modules/audit/pages/AuditPage';
import ProductsListPage from '../../modules/products/pages/ProductsListPage';
import LogsListPage from '../../modules/logs/pages/LogsListPage';
import LogDetalhePage from '../../modules/logs/pages/LogDetalhePage';
import JobExecucoesListPage from '../../modules/jobExecucoes/pages/JobExecucoesListPage';
import JobExecucaoDetalhePage from '../../modules/jobExecucoes/pages/JobExecucaoDetalhePage';
import ProdutoNovoPage from '../../modules/products/pages/ProdutoNovoPage';
import ProdutoEditarPage from '../../modules/products/pages/ProdutoEditarPage';
import OrdersPage from '../../modules/orders/pages/OrdersPage';
import InventoryPage from '../../modules/inventory/pages/InventoryPage';
import BillingPage from '../../modules/billing/pages/BillingPage';
import { performClientLogoutCleanup } from '../../shared/auth/clientSessionCleanup';
import { authService } from '../../modules/auth/services/authService';

function HomeRedirect(): React.ReactElement {
  const [target, setTarget] = useState<'admin' | 'login' | null>(null);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      if (!authService.isAuthenticated()) {
        if (!cancelled) {
          setTarget('login');
        }
        return;
      }
      const ok = await authService.validateSessionWithServer();
      if (cancelled) {
        return;
      }
      if (!ok) {
        performClientLogoutCleanup();
        setTarget('login');
        return;
      }
      setTarget('admin');
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (target === null) {
    return (
      <div
        style={{
          minHeight: '100vh',
          background: '#0F1419',
        }}
      />
    );
  }

  return <Navigate to={target === 'admin' ? '/admin/dashboard' : '/login'} replace />;
}

/**
 * Rotas do app administrativo. Prefixo /admin para área autenticada.
 */
export function AppRoutes(): React.ReactElement {
  return (
    <Routes>
      <Route path="/" element={<HomeRedirect />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/dashboard" element={<Navigate to="/admin/dashboard" replace />} />

      <Route
        path="/admin"
        element={
          <PrivateRoute>
            <AdminLayout />
          </PrivateRoute>
        }
      >
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="users" element={<UsersPage />} />
        <Route path="roles" element={<RolesPage />} />
        <Route path="audit" element={<AuditPage />} />
        <Route path="job-execucoes/:execucaoId" element={<JobExecucaoDetalhePage />} />
        <Route path="job-execucoes" element={<JobExecucoesListPage />} />
        <Route path="logs/:logId" element={<LogDetalhePage />} />
        <Route path="logs" element={<LogsListPage />} />
        <Route path="produtos" element={<ProductsListPage />} />
        <Route path="produtos/novo" element={<ProdutoNovoPage />} />
        <Route path="produtos/:id" element={<ProdutoEditarPage />} />
        <Route path="products" element={<Navigate to="produtos" replace />} />
        <Route path="orders" element={<OrdersPage />} />
        <Route path="inventory" element={<InventoryPage />} />
        <Route path="billing" element={<BillingPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
