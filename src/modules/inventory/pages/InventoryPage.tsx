import React from 'react';
import { useTranslation } from 'react-i18next';
import PlaceholderPage from '../../../shared/components/PlaceholderPage';

function InventoryPage(): React.ReactElement {
  const { t } = useTranslation('common');

  return (
    <PlaceholderPage title={t('modules.inventory.title')} description={t('modules.inventory.desc')} />
  );
}

export default InventoryPage;
