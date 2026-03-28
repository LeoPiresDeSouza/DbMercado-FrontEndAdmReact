import React from 'react';
import './KPIWidget.css';

export type KPITrendDirection = 'up' | 'down' | 'neutral';

export interface KPITrend {
  direction: KPITrendDirection;
  label: string;
}

export interface KPIWidgetProps {
  label: string;
  value: React.ReactNode;
  subtitle?: string;
  trend?: KPITrend;
  className?: string;
}

export function KPIWidget({
  label,
  value,
  subtitle,
  trend,
  className = '',
}: KPIWidgetProps): React.ReactElement {
  return (
    <article className={`ds-kpi ${className}`.trim()} aria-label={label}>
      <p className="ds-kpi__label">{label}</p>
      <p className="ds-kpi__value">{value}</p>
      {subtitle ? <p className="ds-kpi__subtitle">{subtitle}</p> : null}
      {trend ? (
        <p
          className={`ds-kpi__trend ds-kpi__trend--${trend.direction}`}
          aria-label={`Tendência: ${trend.label}`}
        >
          {trend.direction === 'up' ? '↑' : trend.direction === 'down' ? '↓' : '→'} {trend.label}
        </p>
      ) : null}
    </article>
  );
}
