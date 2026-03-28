import React from 'react';
import './DataGridWrapper.css';

export interface DataGridWrapperProps {
  title?: string;
  description?: string;
  toolbar?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

/**
 * Container semântico para tabelas/grids administrativos (web).
 * RN: usar `ScrollView` + header equivalente com os mesmos tokens de spacing.
 */
export function DataGridWrapper({
  title,
  description,
  toolbar,
  children,
  className = '',
}: DataGridWrapperProps): React.ReactElement {
  return (
    <section className={`ds-datagrid ${className}`.trim()} aria-label={title}>
      {(title ?? description ?? toolbar) ? (
        <header className="ds-datagrid__header">
          <div className="ds-datagrid__headline">
            {title ? <h2 className="ds-datagrid__title">{title}</h2> : null}
            {description ? <p className="ds-datagrid__desc">{description}</p> : null}
          </div>
          {toolbar ? <div className="ds-datagrid__toolbar">{toolbar}</div> : null}
        </header>
      ) : null}
      <div className="ds-datagrid__surface">{children}</div>
    </section>
  );
}
