import React from 'react';
import { useTranslation } from 'react-i18next';
import { useDashboardSummaryQuery } from '../../../shared/hooks/useDashboardSummaryQuery';
import { resolveLocalizedErrorMessage } from '../../../shared/utils/resolveLocalizedErrorMessage';
import './DashboardPage.css';

function DashboardPage(): React.ReactElement {
  const { t } = useTranslation(['dashboard', 'common']);
  const { data, isLoading, isFetching, dataUpdatedAt, error } = useDashboardSummaryQuery();

  return (
    <div className="dashboard-page">
      <div className="dashboard-card">
        <h2 className="dashboard-card__title">
          {isLoading ? t('summary.loading') : t('summary.headline')}
        </h2>
        <p className="dashboard-card__text">{t('summary.intro')}</p>
        {error ? (
          <p className="dashboard-card__meta dashboard-card__meta--error">
            {resolveLocalizedErrorMessage(error, t)}
          </p>
        ) : null}
        {data ? (
          <ul className="dashboard-card__meta-list">
            <li className="dashboard-card__meta">
              {t('summary.updated', { val: new Date(data.updatedAt).toLocaleString() })}
            </li>
            <li className="dashboard-card__meta">
              {t('summary.tenant', {
                tenant: data.tenantScope ?? t('summary.tenantDefault'),
              })}
            </li>
            {isFetching && !isLoading ? (
              <li className="dashboard-card__meta">{t('summary.backgroundRefresh')}</li>
            ) : null}
            {dataUpdatedAt ? (
              <li className="dashboard-card__meta">
                {t('summary.cacheAt', { val: new Date(dataUpdatedAt).toLocaleTimeString() })}
              </li>
            ) : null}
          </ul>
        ) : null}
      </div>
    </div>
  );
}

export default DashboardPage;
