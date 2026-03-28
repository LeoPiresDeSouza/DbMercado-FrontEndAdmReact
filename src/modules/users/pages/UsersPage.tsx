import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAdminGridQuery } from '../../../shared/hooks/useAdminGridQuery';
import PlaceholderPage from '../../../shared/components/PlaceholderPage';
import './UsersPage.css';

function UsersPage(): React.ReactElement {
  const { t } = useTranslation('users');
  const [page, setPage] = useState(1);
  const params = useMemo(() => ({ page, pageSize: 20 }), [page]);
  const { data, isLoading, isFetching, dataUpdatedAt } = useAdminGridQuery('users', params);

  return (
    <div className="users-page">
      <PlaceholderPage title={t('page.title')} description={t('page.description')} />
      <section className="users-page__grid-preview" aria-label={t('page.gridAria')}>
        <h3 className="users-page__grid-title">{t('page.gridTitle')}</h3>
        <p className="users-page__grid-desc">
          {t('page.gridDescIntro')}{' '}
          <code>admin / tenant / grid / users / list</code> {t('page.gridDescOutro')}
        </p>
        <div className="users-page__grid-toolbar">
          <button type="button" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>
            {t('page.prev')}
          </button>
          <span>{t('page.pageLabel', { page })}</span>
          <button type="button" onClick={() => setPage((p) => p + 1)}>
            {t('page.next')}
          </button>
        </div>
        <p className="users-page__grid-status">
          {isLoading ? t('page.loading') : null}
          {!isLoading && isFetching ? t('page.refreshing') : null}
          {!isLoading && data
            ? t('page.status', {
                items: data.items.length,
                total: data.totalCount,
                time: new Date(dataUpdatedAt).toLocaleTimeString(),
              })
            : null}
        </p>
      </section>
    </div>
  );
}

export default UsersPage;
