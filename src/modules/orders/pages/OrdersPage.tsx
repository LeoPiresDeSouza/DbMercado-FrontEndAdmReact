import React from 'react';
import { useTranslation } from 'react-i18next';
import PlaceholderPage from '../../../shared/components/PlaceholderPage';

function OrdersPage(): React.ReactElement {
  const { t } = useTranslation('common');

  return (
    <PlaceholderPage title={t('modules.orders.title')} description={t('modules.orders.desc')} />
  );
}

export default OrdersPage;
