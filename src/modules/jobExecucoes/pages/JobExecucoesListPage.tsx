import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import type { GridApi } from 'ag-grid-community';
import { useModulosUsuarioStore } from '../../../shared/stores/modulosUsuarioStore';
import { useNotificationCenterStore } from '../../../shared/stores/notificationCenterStore';
import { resolveLocalizedErrorMessage } from '../../../shared/utils/resolveLocalizedErrorMessage';
import {
  JOB_EXEC_FILTROS_VAZIO,
  JobExecucoesGrid,
  type JobExecucoesFiltrosConsulta,
  type JobExecucoesGridPageSizeOption,
} from '../components/JobExecucoesGrid';
import { JobExecucoesFiltrosPanel } from '../components/JobExecucoesFiltrosPanel';
import type { JobExecucaoGridRow } from '../services/jobExecucaoService';
import {
  JobExecucoesPermissao,
  usuarioTemPermissaoJobExecucoes,
} from '../utils/controleJobExecucoesPermissoes';

const FILTROS_REFRESH_DEBOUNCE_MS = 380;

function JobExecucoesListPage(): React.ReactElement {
  const { t } = useTranslation('common');
  const navigate = useNavigate();
  const modulos = useModulosUsuarioStore((s) => s.modulos);
  const addNotification = useNotificationCenterStore((s) => s.add);
  const gridApiRef = useRef<GridApi<JobExecucaoGridRow> | null>(null);
  const filtrosConsultaRef = useRef<JobExecucoesFiltrosConsulta>(JOB_EXEC_FILTROS_VAZIO);

  const [filtros, setFiltros] = useState<JobExecucoesFiltrosConsulta>(JOB_EXEC_FILTROS_VAZIO);
  const [gridPageSize, setGridPageSize] = useState<JobExecucoesGridPageSizeOption>(20);
  const [painelRecolhido, setPainelRecolhido] = useState(true);
  const filtrosDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  filtrosConsultaRef.current = filtros;

  useEffect(() => {
    return () => {
      if (filtrosDebounceRef.current != null) {
        clearTimeout(filtrosDebounceRef.current);
      }
    };
  }, []);

  const podeAcessar =
    modulos !== null && usuarioTemPermissaoJobExecucoes(modulos, JobExecucoesPermissao.acessar);
  const carregandoModulos = modulos === null;

  const handleFiltrosChange = useCallback(
    (next: JobExecucoesFiltrosConsulta) => {
      filtrosConsultaRef.current = next;
      setFiltros(next);
      if (filtrosDebounceRef.current != null) {
        clearTimeout(filtrosDebounceRef.current);
      }
      filtrosDebounceRef.current = setTimeout(() => {
        filtrosDebounceRef.current = null;
        gridApiRef.current?.refreshServerSide({ purge: true });
      }, FILTROS_REFRESH_DEBOUNCE_MS);
    },
    []
  );

  const handleDatasourceError = useCallback(
    (error: unknown) => {
      addNotification({
        title: t('modules.jobExecucoesAdmin.loadErrorTitle'),
        body: resolveLocalizedErrorMessage(error, t),
        severity: 'error',
      });
    },
    [addNotification, t]
  );

  const handleRowOpen = useCallback(
    (row: JobExecucaoGridRow) => {
      void navigate(`/admin/job-execucoes/${row.id}`);
    },
    [navigate]
  );

  if (carregandoModulos) {
    return (
      <div className="p-6 text-slate-400">
        <p>{t('modules.jobExecucoesAdmin.loadingModules')}</p>
      </div>
    );
  }

  if (!podeAcessar) {
    return (
      <div className="p-6">
        <h1 className="text-xl font-semibold text-slate-100">{t('modules.jobExecucoesAdmin.title')}</h1>
        <p className="mt-2 text-slate-400">{t('modules.jobExecucoesAdmin.noPermission')}</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-0 w-full flex-1 flex-col pb-8 pt-2">
      <header className="mb-4 shrink-0 px-3 sm:px-4" aria-label={t('modules.jobExecucoesAdmin.title')}>
        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <h1 className="text-2xl font-bold text-white">{t('modules.jobExecucoesAdmin.title')}</h1>
            <p className="mt-0.5 max-w-2xl text-sm text-[#718096]">{t('modules.jobExecucoesAdmin.subtitle')}</p>
          </div>
          <div className="flex shrink-0 flex-wrap items-center justify-end gap-3">
            <label className="flex items-center gap-2 text-sm text-[#ADB5BD]">
              <span className="whitespace-nowrap">{t('modules.productsAdmin.gridPageSizeLabel')}</span>
              <select
                className="h-10 rounded-md border border-[#2D3748] bg-[#141B2D] px-3 text-sm text-white shadow-sm focus:border-[#0D6EFD] focus:outline-none focus:ring-2 focus:ring-[rgba(13,110,253,0.45)]"
                aria-label={t('modules.productsAdmin.gridPageSizeLabel')}
                value={gridPageSize === 'all' ? 'all' : String(gridPageSize)}
                onChange={(e) => {
                  const v = e.target.value;
                  setGridPageSize(v === 'all' ? 'all' : (Number(v) as JobExecucoesGridPageSizeOption));
                }}
              >
                <option value="10">10</option>
                <option value="20">20</option>
                <option value="50">50</option>
                <option value="70">70</option>
                <option value="100">100</option>
                <option value="all">{t('modules.productsAdmin.gridPageSizeAll')}</option>
              </select>
            </label>
          </div>
        </div>
      </header>

      <div className="flex min-h-0 min-w-0 flex-1">
        <JobExecucoesFiltrosPanel
          filtros={filtros}
          onChange={handleFiltrosChange}
          recolhido={painelRecolhido}
          onToggleRecolhido={() => setPainelRecolhido((v) => !v)}
        />
        <section
          className="flex min-h-0 min-w-0 flex-1 flex-col overflow-x-auto px-3 pb-2 pt-0 sm:px-4"
          aria-label={t('modules.jobExecucoesAdmin.gridAria')}
        >
          <JobExecucoesGrid
            gridApiRef={gridApiRef}
            filtrosConsultaRef={filtrosConsultaRef}
            onDatasourceError={handleDatasourceError}
            onRowOpen={handleRowOpen}
            pageSize={gridPageSize}
          />
        </section>
      </div>
    </div>
  );
}

export default JobExecucoesListPage;
