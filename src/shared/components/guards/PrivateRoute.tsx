import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { performClientLogoutCleanup } from '../../auth/clientSessionCleanup';
import { authService } from '../../../modules/auth/services/authService';

interface PrivateRouteProps {
  children: React.ReactNode;
}

type GateState = 'checking' | 'in' | 'out';

/**
 * Garante sessão real com a API antes de renderizar a área admin:
 * `isAuthenticated()` no storage pode ser verdadeiro com refresh ainda “no prazo” no cliente
 * enquanto o servidor já revogou o token — aqui forçamos refresh ou negação de acesso.
 */
function PrivateRoute({ children }: PrivateRouteProps): React.ReactElement {
  const [state, setState] = useState<GateState>('checking');

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      if (!authService.isAuthenticated()) {
        if (!cancelled) {
          performClientLogoutCleanup();
          setState('out');
        }
        return;
      }
      const ok = await authService.validateSessionWithServer();
      if (cancelled) {
        return;
      }
      if (!ok) {
        performClientLogoutCleanup();
        setState('out');
        return;
      }
      setState('in');
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (state === 'checking') {
    return (
      <div
        className="private-route-boot"
        style={{
          minHeight: '100vh',
          background: '#0F1419',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#94a3b8',
          fontFamily: 'Poppins, system-ui, sans-serif',
          fontSize: '0.9rem',
        }}
      >
        <span className="sr-only">Validando sessão…</span>
        <span aria-hidden>Validando sessão…</span>
      </div>
    );
  }

  if (state === 'out') {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

export default PrivateRoute;
