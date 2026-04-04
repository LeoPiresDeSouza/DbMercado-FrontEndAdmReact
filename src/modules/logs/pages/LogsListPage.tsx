import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import type { GridApi } from 'ag-grid-community';
import { Eraser, FolderArchive } from 'lucide-react';
import { Button } from '../../../design-system/components/Button/Button';
import { Modal } from '../../../design-system/components/Modal/Modal';
import { useModulosUsuarioStore } from '../../../shared/stores/modulosUsuarioStore';
import { useNotificationCenterStore } from '../../../shared/stores/notificationCenterStore';
import { resolveLocalizedErrorMessage } from '../../../shared/utils/resolveLocalizedErrorMessage';
import { LogBackupsPanel } from '../components/LogBackupsPanel';
import { LogLimpezaConfirmModal } from '../components/LogLimpezaConfirmModal';
import { LogsFiltrosPanel } from '../components/LogsFiltrosPanel';
import {
  LOGS_FILTROS_VAZIO,
  LogsGrid,
  type LogsFiltrosConsulta,
  type LogsGridPageSizeOption,
} from '../components/LogsGrid';
import { excluirAppLog, executarLimpezaLogs } from '../services/appLogService';
import type { AppLogGridRow } from '../services/appLogService';
import {
  ControleLogsPermissao,
  usuarioTemPermissaoControleLogs,
} from '../utils/controleLogsPermissoes';

const FILTROS_REFRESH_DEBOUNCE_MS = 380;

function LogsListPage(): React.ReactElement {
  const { t } = useTranslation('common');
  const navigate = useNavigate();
  const modulos = useModulosUsuarioStore((s) => s.modulos);
  const addNotification = useNotificationCenterStore((s) => s.add);
  const gridApiRef = useRef<GridApi<AppLogGridRow> | null>(null);
  const filtrosConsultaRef = useRef<LogsFiltrosConsulta>(LOGS_FILTROS_VAZIO);

  const [filtros, setFiltros] = useState<LogsFiltrosConsulta>(LOGS_FILTROS_VAZIO);
  const [gridPageSize, setGridPageSize] = useState<LogsGridPageSizeOption>(20);
  const [painelRecolhido, setPainelRecolhido] = useState(true);
  const [mostrarBackups, setMostrarBackups] = useState(false);
  const [limpezaModalOpen, setLimpezaModalOpen] = useState(false);
  const [limpezaRodando, setLimpezaRodando] = useState(false);
  const [linhaExcluir, setLinhaExcluir] = useState<AppLogGridRow | null>(null);
  const [excluirLinhaRodando, setExcluirLinhaRodando] = useState(false);
  const filtrosDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  filtrosConsultaRef.current = filtros;

  useEffect(() => {
    return () => {
      if (filtrosDebounceRef.current != null) {
        clearTimeout(filtrosDebounceRef.current);
      }
    };
  }, []);

  const podeAcessar = modulos !== null && usuarioTemPermissaoControleLogs(modulos, ControleLogsPermissao.acessar);
  /** Coluna de exclusão no grid + modal — permissão `excluirEntrada`. */
  const podeExcluir = modulos !== null && usuarioTemPermissaoControleLogs(modulos, ControleLogsPermissao.excluirEntrada);
  /** Só usuários com permissão explícita `limparLog` em `controledelogs` — independente de `acessar`. */
  const podeLimpar = modulos !== null && usuarioTemPermissaoControleLogs(modulos, ControleLogsPermissao.limparLog);
  const podeBackups = modulos !== null && usuarioTemPermissaoControleLogs(modulos, ControleLogsPermissao.descarregarParaDisco);
  const carregandoModulos = modulos === null;

  useEffect(() => {
    if (!podeLimpar && limpezaModalOpen) {
      setLimpezaModalOpen(false);
    }
  }, [podeLimpar, limpezaModalOpen]);

  useEffect(() => {
    if (!podeExcluir && linhaExcluir != null) {
      setLinhaExcluir(null);
    }
  }, [podeExcluir, linhaExcluir]);

  const refreshGrid = useCallback(() => {
    gridApiRef.current?.refreshServerSide({ purge: true });
  }, []);

  const handleFiltrosChange = useCallback(
    (next: LogsFiltrosConsulta) => {
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
        title: t('modules.logsAdmin.loadErrorTitle'),
        body: resolveLocalizedErrorMessage(error, t),
        severity: 'error',
      });
    },
    [addNotification, t]
  );

  const handleRowOpen = useCallback(
    (row: AppLogGridRow) => {
      void navigate(`/admin/logs/${row.id}`);
    },
    [navigate]
  );

  const handleRequestDeleteRow = useCallback((row: AppLogGridRow) => {
    setLinhaExcluir(row);
  }, []);

  const handleConfirmExcluirLinha = useCallback(async () => {
    if (!podeExcluir || linhaExcluir == null) {
      setLinhaExcluir(null);
      return;
    }
    setExcluirLinhaRodando(true);
    try {
      await excluirAppLog(linhaExcluir.id);
      addNotification({
        title: t('modules.logsAdmin.deleteEntryOkTitle'),
        body: t('modules.logsAdmin.deleteEntryOkBody'),
        severity: 'success',
      });
      setLinhaExcluir(null);
      refreshGrid();
    } catch (error: unknown) {
      addNotification({
        title: t('modules.logsAdmin.deleteError'),
        body: resolveLocalizedErrorMessage(error, t),
        severity: 'error',
      });
    } finally {
      setExcluirLinhaRodando(false);
    }
  }, [addNotification, linhaExcluir, podeExcluir, refreshGrid, t]);

  const handleLimpeza = useCallback(async () => {
    if (!podeLimpar) {
      setLimpezaModalOpen(false);
      return;
    }
    setLimpezaRodando(true);
    try {
      const r = await executarLimpezaLogs();
      addNotification({
        title: t('modules.logsAdmin.limpezaOkTitle'),
        body: t('modules.logsAdmin.limpezaOkBody', {
          count: r.registrosExcluidos,
          file: r.arquivoBackup ?? '—',
        }),
        severity: 'success',
      });
      setLimpezaModalOpen(false);
      refreshGrid();
    } catch (error: unknown) {
      addNotification({
        title: t('modules.logsAdmin.limpezaErroTitle'),
        body: resolveLocalizedErrorMessage(error, t),
        severity: 'error',
      });
    } finally {
      setLimpezaRodando(false);
    }
  }, [addNotification, podeLimpar, refreshGrid, t]);

  if (carregandoModulos) {
    return (
      <div className="p-6 text-slate-400">
        <p>{t('modules.logsAdmin.loadingModules')}</p>
      </div>
    );
  }

  if (!podeAcessar) {
    return (
      <div className="p-6">
        <h1 className="text-xl font-semibold text-slate-100">{t('modules.logsAdmin.title')}</h1>
        <p className="mt-2 text-slate-400">{t('modules.logsAdmin.noPermission')}</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-0 w-full flex-1 flex-col pb-8 pt-2">
      <header className="mb-4 shrink-0 px-3 sm:px-4" aria-label={t('modules.logsAdmin.title')}>
        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <h1 className="text-2xl font-bold text-white">{t('modules.logsAdmin.title')}</h1>
            <p className="mt-0.5 max-w-2xl text-sm text-[#718096]">{t('modules.logsAdmin.subtitle')}</p>
          </div>
          {!mostrarBackups ? (
            <div className="flex shrink-0 flex-wrap items-center justify-end gap-3">
              <label className="flex items-center gap-2 text-sm text-[#ADB5BD]">
                <span className="whitespace-nowrap">{t('modules.productsAdmin.gridPageSizeLabel')}</span>
                <select
                  className="h-10 rounded-md border border-[#2D3748] bg-[#141B2D] px-3 text-sm text-white shadow-sm focus:border-[#0D6EFD] focus:outline-none focus:ring-2 focus:ring-[rgba(13,110,253,0.45)]"
                  aria-label={t('modules.productsAdmin.gridPageSizeLabel')}
                  value={gridPageSize === 'all' ? 'all' : String(gridPageSize)}
                  onChange={(e) => {
                    const v = e.target.value;
                    setGridPageSize(v === 'all' ? 'all' : (Number(v) as LogsGridPageSizeOption));
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
              {podeLimpar ? (
                <button
                  type="button"
                  onClick={() => setLimpezaModalOpen(true)}
                  className="inline-flex items-center gap-2 rounded-md border border-[#DC3545]/30 bg-[#DC3545]/10 px-4 py-2 text-sm font-medium text-[#DC3545] transition-all hover:bg-[#DC3545]/20 focus:outline-none focus:ring-2 focus:ring-[rgba(220,53,69,0.25)]"
                >
                  <Eraser size={16} aria-hidden />
                  {t('modules.logsAdmin.toolbarLimpar')}
                </button>
              ) : null}
              {podeBackups ? (
                <button
                  type="button"
                  onClick={() => setMostrarBackups(true)}
                  className="inline-flex items-center gap-2 rounded-md border border-[#2D3748] bg-[#141B2D] px-4 py-2 text-sm font-medium text-[#ADB5BD] shadow-sm transition-all hover:border-[#4A5568] hover:text-white focus:outline-none focus:ring-2 focus:ring-[rgba(13,110,253,0.3)]"
                >
                  <FolderArchive size={16} aria-hidden />
                  {t('modules.logsAdmin.toolbarBackups')}
                </button>
              ) : null}
            </div>
          ) : null}
        </div>
      </header>

      <div style={{ display: mostrarBackups ? 'none' : 'flex' }} className="flex min-h-0 min-w-0 flex-1">
        <LogsFiltrosPanel
          filtros={filtros}
          onChange={handleFiltrosChange}
          recolhido={painelRecolhido}
          onToggleRecolhido={() => setPainelRecolhido((v) => !v)}
        />
        <section
          className="flex min-h-0 min-w-0 flex-1 flex-col overflow-x-auto px-3 pb-2 pt-0 sm:px-4"
          aria-label={t('modules.logsAdmin.gridAria')}
        >
          <LogsGrid
            gridApiRef={gridApiRef}
            filtrosConsultaRef={filtrosConsultaRef}
            onDatasourceError={handleDatasourceError}
            onRowOpen={handleRowOpen}
            pageSize={gridPageSize}
            podeExcluir={podeExcluir}
            onRequestDeleteRow={handleRequestDeleteRow}
          />
        </section>
      </div>

      <div className="min-h-0 flex-1 px-3 sm:px-4" style={{ display: mostrarBackups ? 'block' : 'none' }}>
        <LogBackupsPanel onVoltar={() => setMostrarBackups(false)} />
      </div>

      {podeLimpar ? (
        <LogLimpezaConfirmModal
          open={limpezaModalOpen}
          confirming={limpezaRodando}
          onClose={() => {
            if (!limpezaRodando) {
              setLimpezaModalOpen(false);
            }
          }}
          onConfirm={handleLimpeza}
        />
      ) : null}

      {podeExcluir ? (
        <Modal
          open={linhaExcluir != null}
          title={t('modules.logsAdmin.deleteConfirmTitle')}
          onClose={() => {
            if (!excluirLinhaRodando) {
              setLinhaExcluir(null);
            }
          }}
          size="sm"
          footer={
            <>
              <Button
                type="button"
                variant="secondary"
                size="md"
                disabled={excluirLinhaRodando}
                onClick={() => setLinhaExcluir(null)}
              >
                {t('modules.logsAdmin.deleteConfirmCancel')}
              </Button>
              <Button
                type="button"
                variant="primary"
                size="md"
                loading={excluirLinhaRodando}
                className="!border-red-600 !bg-red-600"
                onClick={() => void handleConfirmExcluirLinha()}
              >
                {t('modules.logsAdmin.deleteConfirmOk')}
              </Button>
            </>
          }
        >
          <p className="text-sm text-slate-300">{t('modules.logsAdmin.deleteConfirmBody')}</p>
        </Modal>
      ) : null}
    </div>
  );
}

export default LogsListPage;
