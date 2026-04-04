import React from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import '../../../shared/styles/productFacetNav.css';
import type { LogsFiltrosConsulta } from './LogsGrid';

const LOG_LEVELS = ['Trace', 'Debug', 'Information', 'Warning', 'Error', 'Critical'] as const;

export type LogsFiltrosPanelProps = {
  filtros: LogsFiltrosConsulta;
  onChange: (next: LogsFiltrosConsulta) => void;
  recolhido: boolean;
  onToggleRecolhido: () => void;
};

export function LogsFiltrosPanel(props: LogsFiltrosPanelProps): React.ReactElement {
  const { filtros, onChange, recolhido, onToggleRecolhido } = props;
  const { t } = useTranslation('common');

  const toggleLevel = (level: string): void => {
    const set = new Set(filtros.levels);
    if (set.has(level)) {
      set.delete(level);
    } else {
      set.add(level);
    }
    onChange({ ...filtros, levels: [...set] });
  };

  if (recolhido) {
    return (
      <aside
        className="product-facet-sidebar--rail relative z-20 flex w-10 shrink-0 flex-col items-center pt-4"
        aria-label={t('modules.logsAdmin.filtersTitle')}
      >
        <button
          type="button"
          onClick={onToggleRecolhido}
          title={t('modules.logsAdmin.filtersExpand')}
          className="product-facet-sidebar__icon-btn"
        >
          <ChevronRight size={16} aria-hidden />
        </button>
      </aside>
    );
  }

  return (
    <aside
      className="product-facet-sidebar relative z-20 flex w-72 shrink-0 flex-col overflow-hidden"
      aria-label={t('modules.logsAdmin.filtersTitle')}
    >
      <div className="product-facet-sidebar__header">
        <span className="product-facet-sidebar__title">{t('modules.logsAdmin.filtersTitle')}</span>
        <button
          type="button"
          onClick={onToggleRecolhido}
          title={t('modules.logsAdmin.filtersCollapse')}
          className="product-facet-sidebar__icon-btn"
        >
          <ChevronLeft size={14} aria-hidden />
        </button>
      </div>

      <div className="product-facet-sidebar__body">
        <div className="space-y-2">
          <label className="block text-xs font-medium text-slate-400" htmlFor="logs-filtro-inicio">
            {t('modules.logsAdmin.filterDateStart')}
          </label>
          <input
            id="logs-filtro-inicio"
            type="datetime-local"
            className="w-full rounded-lg border border-[#1e293b] bg-[#0F1419] px-2 py-1.5 text-sm text-slate-100"
            value={filtros.dataInicio ?? ''}
            onChange={(e) => onChange({ ...filtros, dataInicio: e.target.value || null })}
          />
        </div>

        <div className="space-y-2">
          <label className="block text-xs font-medium text-slate-400" htmlFor="logs-filtro-fim">
            {t('modules.logsAdmin.filterDateEnd')}
          </label>
          <input
            id="logs-filtro-fim"
            type="datetime-local"
            className="w-full rounded-lg border border-[#1e293b] bg-[#0F1419] px-2 py-1.5 text-sm text-slate-100"
            value={filtros.dataFim ?? ''}
            onChange={(e) => onChange({ ...filtros, dataFim: e.target.value || null })}
          />
        </div>

        <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-200">
          <input
            type="checkbox"
            className="h-4 w-4 rounded border-[#1e293b] bg-[#0F1419]"
            checked={filtros.somenteComExcecao}
            onChange={(e) => onChange({ ...filtros, somenteComExcecao: e.target.checked })}
          />
          {t('modules.logsAdmin.filterOnlyException')}
        </label>

        <div className="space-y-2">
          <div className="text-xs font-medium text-slate-400">{t('modules.logsAdmin.filterLevels')}</div>
          <ul className="space-y-1.5">
            {LOG_LEVELS.map((lv) => (
              <li key={lv}>
                <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-200">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-[#1e293b] bg-[#0F1419]"
                    checked={filtros.levels.includes(lv)}
                    onChange={() => toggleLevel(lv)}
                  />
                  {lv}
                </label>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </aside>
  );
}
