import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { SUPPORTED_LANGUAGES, type SupportedLanguage } from '../../../shared/i18n/constants';
import { useAuthStore } from '../../../shared/stores/authStore';
import { performClientLogoutCleanup } from '../../../shared/auth/clientSessionCleanup';
import { resolveLocalizedErrorMessage } from '../../../shared/utils/resolveLocalizedErrorMessage';
import { authService } from '../services/authService';
import './LoginPage.css';

function LoginPage(): React.ReactElement {
  const { t, i18n } = useTranslation(['auth', 'common']);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionProbe, setSessionProbe] = useState<'idle' | 'checking' | 'done'>('idle');
  const navigate = useNavigate();

  useEffect(() => {
    let cancelled = false;
    setSessionProbe('checking');
    void (async () => {
      if (!authService.isAuthenticated()) {
        if (!cancelled) {
          setSessionProbe('done');
        }
        return;
      }
      const ok = await authService.validateSessionWithServer();
      if (cancelled) {
        return;
      }
      if (ok) {
        navigate('/admin/dashboard', { replace: true });
      } else {
        performClientLogoutCleanup();
      }
      setSessionProbe('done');
    })();
    return () => {
      cancelled = true;
    };
  }, [navigate]);

  const handleLanguageChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const lng = event.target.value as SupportedLanguage;
    void i18n.changeLanguage(lng);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError('');

    try {
      await authService.login(email, password);
      useAuthStore.getState().afterSuccessfulAuth();
      navigate('/admin/dashboard');
    } catch (err: unknown) {
      setError(resolveLocalizedErrorMessage(err, t));
    } finally {
      setLoading(false);
    }
  };

  if (sessionProbe === 'checking') {
    return (
      <div className="login-page">
        <div className="login-panel">
          <p className="login-welcome" aria-live="polite">
            Validando sessão…
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="login-page">
      <div className="login-panel">
        <div className="login-lang">
          <label htmlFor="login-lang" className="login-lang__label">
            {t('language')}
          </label>
          <select
            id="login-lang"
            className="login-lang__select"
            value={i18n.language}
            onChange={handleLanguageChange}
            aria-label={t('language')}
          >
            {SUPPORTED_LANGUAGES.map((lng) => (
              <option key={lng} value={lng}>
                {lng}
              </option>
            ))}
          </select>
        </div>

        <h1 className="login-logo">{t('brand')}</h1>
        <p className="login-welcome">{t('welcome')}</p>

        <form onSubmit={handleSubmit}>
          <div className="login-form-group">
            <label htmlFor="email">{t('email')}</label>
            <input
              type="text"
              id="email"
              className="login-input"
              placeholder={t('emailPlaceholder')}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              autoComplete="username"
            />
          </div>
          <div className="login-form-group">
            <label htmlFor="password">{t('password')}</label>
            <input
              type="password"
              id="password"
              className="login-input"
              placeholder={t('passwordPlaceholder')}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              autoComplete="current-password"
            />
          </div>

          <div className="login-actions">
            <span className="login-forgot-placeholder">{t('forgot')}</span>
          </div>

          <button type="submit" className="login-submit" disabled={loading}>
            {loading ? t('submitting') : t('submit')}
          </button>
          {error ? <div className="login-error">{error}</div> : null}
        </form>
      </div>
    </div>
  );
}

export default LoginPage;
