import React from 'react';
import { useTranslation } from 'react-i18next';
import PlaceholderPage from '../../../shared/components/PlaceholderPage';

function AuditPage(): React.ReactElement {
  const { t } = useTranslation('audit');

  return <PlaceholderPage title={t('page.title')} description={t('page.description')} />;
}

export default AuditPage;
