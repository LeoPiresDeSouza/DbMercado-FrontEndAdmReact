import React from 'react';
import { useTranslation } from 'react-i18next';
import PlaceholderPage from '../../../shared/components/PlaceholderPage';
import { notifyPermissionsChanged } from '../../../shared/stores/permissionStore';
import './RolesPage.css';

function RolesPage(): React.ReactElement {
  const { t } = useTranslation('roles');

  return (
    <div className="roles-page">
      <PlaceholderPage title={t('page.title')} description={t('page.description')} />
      <div className="roles-page__dev-actions">
        <p className="roles-page__dev-hint">
          {t('page.devHintBefore')} <code>notifyPermissionsChanged()</code> {t('page.devHintAfter')}
        </p>
        <button type="button" className="roles-page__dev-btn" onClick={() => notifyPermissionsChanged()}>
          {t('page.simButton')}
        </button>
      </div>
    </div>
  );
}

export default RolesPage;
