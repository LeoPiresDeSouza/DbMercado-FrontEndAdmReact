import React from 'react';
import './AuditTimeline.css';

export type AuditTimelineVariant = 'default' | 'success' | 'warning' | 'danger';

export interface AuditTimelineItemData {
  id: string;
  atUtc: string;
  title: string;
  description?: string;
  variant?: AuditTimelineVariant;
}

export interface AuditTimelineProps {
  items: AuditTimelineItemData[];
  emptyLabel?: string;
  className?: string;
}

function formatWhen(iso: string): string {
  const d = Date.parse(iso);
  if (Number.isNaN(d)) {
    return iso;
  }
  return new Date(d).toLocaleString();
}

export function AuditTimeline({
  items,
  emptyLabel = 'Nenhum evento de auditoria.',
  className = '',
}: AuditTimelineProps): React.ReactElement {
  if (items.length === 0) {
    return (
      <p className={`ds-audit-timeline__empty ${className}`.trim()} role="status">
        {emptyLabel}
      </p>
    );
  }

  return (
    <ol className={`ds-audit-timeline ${className}`.trim()} aria-label="Linha do tempo de auditoria">
      {items.map((item) => {
        const v = item.variant ?? 'default';
        return (
          <li key={item.id} className={`ds-audit-timeline__item ds-audit-timeline__item--${v}`}>
            <div className="ds-audit-timeline__marker" aria-hidden />
            <div className="ds-audit-timeline__card">
              <time className="ds-audit-timeline__time" dateTime={item.atUtc}>
                {formatWhen(item.atUtc)}
              </time>
              <h3 className="ds-audit-timeline__title">{item.title}</h3>
              {item.description ? <p className="ds-audit-timeline__desc">{item.description}</p> : null}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
