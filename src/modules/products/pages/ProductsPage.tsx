import React from 'react';
import { useTranslation } from 'react-i18next';
import PlaceholderPage from '../../../shared/components/PlaceholderPage';

function ProductsPage(): React.ReactElement {
  const { t } = useTranslation('common');

  return (
    <PlaceholderPage title={t('modules.products.title')} description={t('modules.products.desc')} />
  );
}

export default ProductsPage;
