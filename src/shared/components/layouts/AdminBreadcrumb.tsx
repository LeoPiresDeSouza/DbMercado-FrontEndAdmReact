import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useLocation } from 'react-router-dom';
import './AdminBreadcrumb.css';

interface Crumb {
  path: string;
  label: string;
}

function AdminBreadcrumb(): React.ReactElement | null {
  const { pathname } = useLocation();
  const { t, i18n } = useTranslation('common');

  const crumbs = useMemo((): Crumb[] => {
    const segments = pathname.split('/').filter(Boolean);
    if (segments.length === 0) {
      return [];
    }

    const items: Crumb[] = [];
    let acc = '';
    segments.forEach((seg) => {
      acc += `/${seg}`;
      const key = `breadcrumb.${seg}`;
      const label = t(key, { defaultValue: seg.replace(/-/g, ' ') });
      items.push({ path: acc, label });
    });
    return items;
  }, [pathname, t, i18n.language]);

  if (crumbs.length === 0) {
    return null;
  }

  return (
    <nav className="admin-breadcrumb" aria-label={t('breadcrumbAria')}>
      <ol className="admin-breadcrumb__list">
        {crumbs.map((c, i) => (
          <li key={c.path} className="admin-breadcrumb__item">
            {i < crumbs.length - 1 ? (
              <>
                <Link to={c.path} className="admin-breadcrumb__link">
                  {c.label}
                </Link>
                <span className="admin-breadcrumb__sep" aria-hidden>
                  /
                </span>
              </>
            ) : (
              <span className="admin-breadcrumb__current">{c.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

export default AdminBreadcrumb;
