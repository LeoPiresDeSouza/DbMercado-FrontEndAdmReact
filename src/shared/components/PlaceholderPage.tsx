import React from 'react';
import { useTranslation } from 'react-i18next';
import './PlaceholderPage.css';

interface PlaceholderPageProps {
  title: string;
  description?: string;
}

/**
 * Página temporária para rotas ainda não implementadas (módulos futuros).
 */
function PlaceholderPage({ title, description }: PlaceholderPageProps): React.ReactElement {
  const { t } = useTranslation('common');
  return (
    <div className="placeholder-page">
      <h2 className="placeholder-page__title">{title}</h2>
      <p className="placeholder-page__desc">
        {description ?? t('placeholder.defaultDescription')}
      </p>
    </div>
  );
}

export default PlaceholderPage;
