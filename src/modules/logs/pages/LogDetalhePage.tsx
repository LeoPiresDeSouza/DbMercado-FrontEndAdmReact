import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Loader2, Trash2 } from 'lucide-react';
import { useModulosUsuarioStore } from '../../../shared/stores/modulosUsuarioStore';
import { Button } from '../../../design-system/components/Button/Button';
import { Modal } from '../../../design-system/components/Modal/Modal';
import { obterAppLogDetalhe, excluirAppLog, type AppLogDetalhe } from '../services/appLogService';
import {
  ControleLogsPermissao,
  usuarioTemPermissaoControleLogs,
} from '../utils/controleLogsPermissoes';

function LogDetalhePage(): React.ReactElement {
  const { t } = useTranslation('common');
  const navigate = useNavigate();
  const { logId: logIdParam } = useParams<{ logId: string }>();
  const modulos = useModulosUsuarioStore((s) => s.modulos);

  const logId = logIdParam != null ? Number(logIdParam) : NaN;
  const idValido = Number.isFinite(logId) && logId > 0;

  const podeAcessar = modulos !== null && usuarioTemPermissaoControleLogs(modulos, ControleLogsPermissao.acessar);
  /** Permissão `excluirEntrada` em `controledelogs` — botão e modal de exclusão. */
  const podeExcluir = modulos !== null && usuarioTemPermissaoControleLogs(modulos, ControleLogsPermissao.excluirEntrada);
  const carregandoModulos = modulos === null;

  const [detalhe, setDetalhe] = useState<AppLogDetalhe | null>(null);
  const [loading, setLoading] = useState(false);
  const [excluindo, setExcluindo] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [confirmarExcluir, setConfirmarExcluir] = useState(false);

  useEffect(() => {
    if (!podeExcluir && confirmarExcluir) {
      setConfirmarExcluir(false);
    }
  }, [podeExcluir, confirmarExcluir]);

  useEffect(() => {
    if (!idValido) {
      setDetalhe(null);
      setErro(null);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setErro(null);
    void obterAppLogDetalhe(logId)
      .then((d) => {
        if (!cancelled) {
          setDetalhe(d);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setErro(t('modules.logsAdmin.detailLoadError'));
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [idValido, logId, t]);

  const handleExcluir = async (): Promise<void> => {
    if (!podeExcluir || !idValido) {
      setConfirmarExcluir(false);
      return;
    }
    setExcluindo(true);
    try {
      await excluirAppLog(logId);
      setConfirmarExcluir(false);
      void navigate('/admin/logs');
    } catch {
      setErro(t('modules.logsAdmin.deleteError'));
    } finally {
      setExcluindo(false);
    }
  };

  const field = (label: string, value: string | null | undefined): React.ReactElement => (
    <div className="space-y-1">
      <div className="text-xs font-medium text-slate-500">{label}</div>
      <div className="break-all text-sm text-slate-100">{value && value.length > 0 ? value : '—'}</div>
    </div>
  );

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

  if (!idValido) {
    return (
      <div className="flex min-h-0 flex-1 flex-col">
        <div className="mx-auto w-full max-w-5xl px-3 py-6 sm:px-4">
          <p className="text-sm text-amber-400">{t('modules.logsAdmin.detailInvalidId')}</p>
          <Link
            to="/admin/logs"
            className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-[#0D6EFD] hover:underline"
          >
            <ArrowLeft size={16} aria-hidden />
            {t('modules.logsAdmin.detailBackToList')}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="flex min-h-0 flex-1 flex-col">
        <div className="mx-auto w-full max-w-5xl">
          <div className="mb-8 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <Link
                to="/admin/logs"
                className="mb-2 inline-flex items-center gap-1.5 text-sm font-medium text-[#0D6EFD] transition-colors hover:text-[#0B5ED7] hover:underline"
              >
                <ArrowLeft size={16} aria-hidden />
                {t('modules.logsAdmin.detailBackToList')}
              </Link>
              <h1 className="text-2xl font-bold text-white">{t('modules.logsAdmin.detailTitle')}</h1>
              <p className="mt-0.5 text-sm text-[#718096]">
                {t('modules.logsAdmin.detailPageSubtitle', { id: logId })}
              </p>
            </div>
          </div>

          <div className="sticky top-0 z-10 mb-6 flex flex-col gap-4 rounded-xl border border-[#2D3748] bg-[rgba(20,27,45,0.95)] px-6 py-4 shadow-md backdrop-blur-sm sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-lg font-semibold text-white">{t('modules.logsAdmin.detailTitle')}</h2>
            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-end">
              <Link
                to="/admin/logs"
                className="inline-flex items-center justify-center gap-2 rounded-md border border-[#2D3748] bg-[#141B2D] px-5 py-2.5 text-sm font-medium text-[#ADB5BD] shadow-sm transition-all hover:border-[#4A5568] hover:text-white focus:outline-none focus:ring-2 focus:ring-[rgba(13,110,253,0.3)]"
              >
                {t('modules.logsAdmin.detailBackToList')}
              </Link>
              {podeExcluir ? (
                <Button
                  type="button"
                  variant="primary"
                  size="md"
                  className="!border-red-600 !bg-red-600 hover:!bg-red-700"
                  onClick={() => setConfirmarExcluir(true)}
                >
                  <span className="inline-flex items-center justify-center gap-2">
                    <Trash2 className="h-4 w-4" aria-hidden />
                    {t('modules.logsAdmin.deleteEntry')}
                  </span>
                </Button>
              ) : null}
            </div>
          </div>

          <div className="rounded-xl border border-[#2D3748] bg-[#141B2D] px-6 py-5 shadow-md">
            {loading ? (
              <div className="flex justify-center py-12 text-sky-400">
                <Loader2 className="h-8 w-8 animate-spin" aria-hidden />
              </div>
            ) : erro ? (
              <p className="text-sm text-amber-400">{erro}</p>
            ) : detalhe ? (
              <div className="space-y-4">
                {field(t('modules.logsAdmin.detailId'), String(detalhe.id))}
                {field(t('modules.logsAdmin.detailCreatedAt'), detalhe.createdAt)}
                {field(t('modules.logsAdmin.colLevel'), detalhe.level)}
                {field(t('modules.logsAdmin.colCategory'), detalhe.category)}
                {field(t('modules.logsAdmin.colMessage'), detalhe.message)}
                {field(t('modules.logsAdmin.detailErrorCode'), detalhe.errorCode ?? undefined)}
                {field(t('modules.logsAdmin.detailTraceId'), detalhe.traceId ?? undefined)}
                {field(t('modules.logsAdmin.detailUserId'), detalhe.userId ?? undefined)}
                {field(t('modules.logsAdmin.colUser'), detalhe.userName ?? undefined)}
                {field(t('modules.logsAdmin.colPath'), detalhe.path ?? undefined)}
                {field(t('modules.logsAdmin.colMethod'), detalhe.method ?? undefined)}
                {field(t('modules.logsAdmin.detailIp'), detalhe.ip ?? undefined)}
                {field(t('modules.logsAdmin.detailUserAgent'), detalhe.userAgent ?? undefined)}
                <div className="space-y-1">
                  <div className="text-xs font-medium text-slate-500">{t('modules.logsAdmin.detailException')}</div>
                  <pre className="max-h-48 overflow-auto rounded-lg bg-[#0F1419] p-3 text-xs text-slate-300">
                    {detalhe.exception && detalhe.exception.length > 0 ? detalhe.exception : '—'}
                  </pre>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>

      {podeExcluir ? (
        <Modal
          open={confirmarExcluir}
          title={t('modules.logsAdmin.deleteConfirmTitle')}
          onClose={() => {
            if (!excluindo) {
              setConfirmarExcluir(false);
            }
          }}
          size="sm"
          footer={
            <>
              <Button type="button" variant="secondary" size="md" disabled={excluindo} onClick={() => setConfirmarExcluir(false)}>
                {t('modules.logsAdmin.deleteConfirmCancel')}
              </Button>
              <Button
                type="button"
                variant="primary"
                size="md"
                loading={excluindo}
                className="!border-red-600 !bg-red-600"
                onClick={() => void handleExcluir()}
              >
                {t('modules.logsAdmin.deleteConfirmOk')}
              </Button>
            </>
          }
        >
          <p className="text-sm text-slate-300">{t('modules.logsAdmin.deleteConfirmBody')}</p>
        </Modal>
      ) : null}
    </>
  );
}

export default LogDetalhePage;
