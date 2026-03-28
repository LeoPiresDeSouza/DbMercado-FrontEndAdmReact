import React from 'react';
import { useTranslation } from 'react-i18next';
import PlaceholderPage from '../../../shared/components/PlaceholderPage';

function BillingPage(): React.ReactElement {
  const { t } = useTranslation('common');

  return (
    <PlaceholderPage title={t('modules.billing.title')} description={t('modules.billing.desc')} />
  );
}

export default BillingPage;
