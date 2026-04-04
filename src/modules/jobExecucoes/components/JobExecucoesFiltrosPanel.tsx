import React from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import '../../../shared/styles/productFacetNav.css';
import type { JobExecucoesFiltrosConsulta } from './JobExecucoesGrid';

export type JobExecucoesFiltrosPanelProps = {
  filtros: JobExecucoesFiltrosConsulta;
  onChange: (next: JobExecucoesFiltrosConsulta) => void;
  recolhido: boolean;
  onToggleRecolhido: () => void;
};

export function JobExecucoesFiltrosPanel(props: JobExecucoesFiltrosPanelProps): React.ReactElement {
  const { filtros, onChange, recolhido, onToggleRecolhido } = props;
  const { t } = useTranslation('common');

  if (recolhido) {
    return (
      <aside
        className="product-facet-sidebar--rail relative z-20 flex w-10 shrink-0 flex-col items-center pt-4"
        aria-label={t('modules.jobExecucoesAdmin.filtersTitle')}
      >
        <button
          type="button"
          onClick={onToggleRecolhido}
          title={t('modules.jobExecucoesAdmin.filtersExpand')}
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
      aria-label={t('modules.jobExecucoesAdmin.filtersTitle')}
    >
      <div className="product-facet-sidebar__header">
        <span className="product-facet-sidebar__title">{t('modules.jobExecucoesAdmin.filtersTitle')}</span>
        <button
          type="button"
          onClick={onToggleRecolhido}
          title={t('modules.jobExecucoesAdmin.filtersCollapse')}
          className="product-facet-sidebar__icon-btn"
        >
          <ChevronLeft size={14} aria-hidden />
        </button>
      </div>

      <div className="product-facet-sidebar__body">
        <div className="space-y-2">
          <label className="block text-xs font-medium text-slate-400" htmlFor="job-exec-filtro-inicio">
            {t('modules.jobExecucoesAdmin.filterDateStart')}
          </label>
          <input
            id="job-exec-filtro-inicio"
            type="datetime-local"
            className="w-full rounded-lg border border-[#1e293b] bg-[#0F1419] px-2 py-1.5 text-sm text-slate-100"
            value={filtros.dataInicio ?? ''}
            onChange={(e) => onChange({ ...filtros, dataInicio: e.target.value || null })}
          />
        </div>

        <div className="space-y-2">
          <label className="block text-xs font-medium text-slate-400" htmlFor="job-exec-filtro-fim">
            {t('modules.jobExecucoesAdmin.filterDateEnd')}
          </label>
          <input
            id="job-exec-filtro-fim"
            type="datetime-local"
            className="w-full rounded-lg border border-[#1e293b] bg-[#0F1419] px-2 py-1.5 text-sm text-slate-100"
            value={filtros.dataFim ?? ''}
            onChange={(e) => onChange({ ...filtros, dataFim: e.target.value || null })}
          />
        </div>

        <div className="space-y-2">
          <label className="block text-xs font-medium text-slate-400" htmlFor="job-exec-filtro-nome">
            {t('modules.jobExecucoesAdmin.filterJobName')}
          </label>
          <input
            id="job-exec-filtro-nome"
            type="text"
            autoComplete="off"
            placeholder={t('modules.jobExecucoesAdmin.filterJobNamePlaceholder')}
            className="w-full rounded-lg border border-[#1e293b] bg-[#0F1419] px-2 py-1.5 text-sm text-slate-100 placeholder:text-slate-600"
            value={filtros.jobNome}
            onChange={(e) => onChange({ ...filtros, jobNome: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <label className="block text-xs font-medium text-slate-400" htmlFor="job-exec-filtro-resultado">
            {t('modules.jobExecucoesAdmin.filterResult')}
          </label>
          <select
            id="job-exec-filtro-resultado"
            className="w-full rounded-lg border border-[#1e293b] bg-[#0F1419] px-2 py-1.5 text-sm text-slate-100"
            value={filtros.resultado}
            onChange={(e) =>
              onChange({
                ...filtros,
                resultado: e.target.value as JobExecucoesFiltrosConsulta['resultado'],
              })
            }
          >
            <option value="todos">{t('modules.jobExecucoesAdmin.filterResultAll')}</option>
            <option value="sucesso">{t('modules.jobExecucoesAdmin.filterResultSuccess')}</option>
            <option value="falha">{t('modules.jobExecucoesAdmin.filterResultFailure')}</option>
            <option value="emAndamento">{t('modules.jobExecucoesAdmin.filterResultRunning')}</option>
          </select>
        </div>
      </div>
    </aside>
  );
}
