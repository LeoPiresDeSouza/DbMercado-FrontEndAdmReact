import React, { Suspense } from 'react';
import ReactDOM from 'react-dom/client';
import './shared/agGrid/registerAgGridEnterprise';
import './design-system/global.css';
import App from './app/App';
import { i18n, i18nReady } from './shared/i18n';

void i18nReady.then(() => {
  const rootElement = document.getElementById('root');
  if (!rootElement) {
    throw new Error(i18n.t('common:errors.rootNotFound'));
  }

  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <Suspense fallback={<div className="i18n-boot" aria-busy="true" />}>
        <App />
      </Suspense>
    </React.StrictMode>
  );
});
