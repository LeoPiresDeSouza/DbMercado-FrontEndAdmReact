import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { useModulosUsuarioStore } from '../../../shared/stores/modulosUsuarioStore';
import { obterJobExecucaoDetalhe, type JobExecucaoDetalhe } from '../services/jobExecucaoService';
import {
  JobExecucoesPermissao,
  usuarioTemPermissaoJobExecucoes,
} from '../utils/controleJobExecucoesPermissoes';

function formatWhen(iso: string | undefined): string {
  if (!iso) return '—';
  const d = new Date(iso);
  return Number.isNaN(d.getTime())
    ? iso
    : new Intl.DateTimeFormat(undefined, {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        timeZoneName: 'short',
      }).format(d);
}

function JobExecucaoDetalhePage(): React.ReactElement {
  const { t } = useTranslation('common');
  const { execucaoId: execucaoIdParam } = useParams<{ execucaoId: string }>();
  const modulos = useModulosUsuarioStore((s) => s.modulos);

  const execId = execucaoIdParam != null ? Number(execucaoIdParam) : NaN;
  const idValido = Number.isFinite(execId) && execId > 0;

  const podeAcessar =
    modulos !== null && usuarioTemPermissaoJobExecucoes(modulos, JobExecucoesPermissao.acessar);
  const carregandoModulos = modulos === null;

  const [detalhe, setDetalhe] = useState<JobExecucaoDetalhe | null>(null);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    if (!idValido) {
      setDetalhe(null);
      setErro(null);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setErro(null);
    void obterJobExecucaoDetalhe(execId)
      .then((d) => {
        if (!cancelled) {
          setDetalhe(d);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setErro(t('modules.jobExecucoesAdmin.detailLoadError'));
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
  }, [idValido, execId, t]);

  const field = (label: string, value: string | null | undefined): React.ReactElement => (
    <div className="space-y-1">
      <div className="text-xs font-medium text-slate-500">{label}</div>
      <div className="break-all text-sm text-slate-100">{value && value.length > 0 ? value : '—'}</div>
    </div>
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

  if (!idValido) {
    return (
      <div className="flex min-h-0 flex-1 flex-col">
        <div className="mx-auto w-full max-w-5xl px-3 py-6 sm:px-4">
          <p className="text-sm text-amber-400">{t('modules.jobExecucoesAdmin.detailInvalidId')}</p>
          <Link
            to="/admin/job-execucoes"
            className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-[#0D6EFD] hover:underline"
          >
            <ArrowLeft size={16} aria-hidden />
            {t('modules.jobExecucoesAdmin.detailBackToList')}
          </Link>
        </div>
      </div>
    );
  }

  const duracaoLabel =
    detalhe?.duracaoMs != null
      ? detalhe.duracaoMs < 1000
        ? t('modules.jobExecucoesAdmin.durationMs', { n: detalhe.duracaoMs })
        : t('modules.jobExecucoesAdmin.durationSec', {
            n: Number((detalhe.duracaoMs / 1000).toFixed(detalhe.duracaoMs < 10000 ? 2 : 1)),
          })
      : '—';

  let resultadoLabel = '—';
  if (detalhe) {
    if (detalhe.fimUtc == null || detalhe.fimUtc === '') {
      resultadoLabel = t('modules.jobExecucoesAdmin.badgeRunning');
    } else if (detalhe.sucesso === true) {
      resultadoLabel = t('modules.jobExecucoesAdmin.badgeOk');
    } else if (detalhe.sucesso === false) {
      resultadoLabel = t('modules.jobExecucoesAdmin.badgeFail');
    }
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="mx-auto w-full max-w-5xl">
        <div className="mb-8 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Link
              to="/admin/job-execucoes"
              className="mb-2 inline-flex items-center gap-1.5 text-sm font-medium text-[#0D6EFD] transition-colors hover:text-[#0B5ED7] hover:underline"
            >
              <ArrowLeft size={16} aria-hidden />
              {t('modules.jobExecucoesAdmin.detailBackToList')}
            </Link>
            <h1 className="text-2xl font-bold text-white">{t('modules.jobExecucoesAdmin.detailTitle')}</h1>
            <p className="mt-0.5 text-sm text-[#718096]">
              {t('modules.jobExecucoesAdmin.detailPageSubtitle', { id: execId })}
            </p>
          </div>
        </div>

        <div className="sticky top-0 z-10 mb-6 flex flex-col gap-4 rounded-xl border border-[#2D3748] bg-[rgba(20,27,45,0.95)] px-6 py-4 shadow-md backdrop-blur-sm sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-lg font-semibold text-white">{t('modules.jobExecucoesAdmin.detailTitle')}</h2>
          <Link
            to="/admin/job-execucoes"
            className="inline-flex items-center justify-center gap-2 rounded-md border border-[#2D3748] bg-[#141B2D] px-5 py-2.5 text-sm font-medium text-[#ADB5BD] shadow-sm transition-all hover:border-[#4A5568] hover:text-white focus:outline-none focus:ring-2 focus:ring-[rgba(13,110,253,0.3)]"
          >
            {t('modules.jobExecucoesAdmin.detailBackToList')}
          </Link>
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
              {field(t('modules.jobExecucoesAdmin.detailId'), String(detalhe.id))}
              {field(t('modules.jobExecucoesAdmin.colFireInstance'), detalhe.fireInstanceId)}
              {field(t('modules.jobExecucoesAdmin.colJobName'), detalhe.jobNome)}
              {field(t('modules.jobExecucoesAdmin.colJobGroup'), detalhe.jobGrupo)}
              {field(t('modules.jobExecucoesAdmin.colTriggerName'), detalhe.triggerNome)}
              {field(t('modules.jobExecucoesAdmin.colTriggerGroup'), detalhe.triggerGrupo)}
              {field(t('modules.jobExecucoesAdmin.detailStartUtc'), formatWhen(detalhe.inicioUtc))}
              {field(t('modules.jobExecucoesAdmin.detailEndUtc'), formatWhen(detalhe.fimUtc ?? undefined))}
              {field(t('modules.jobExecucoesAdmin.colDuration'), duracaoLabel)}
              {field(t('modules.jobExecucoesAdmin.colResult'), resultadoLabel)}
              <div className="space-y-1">
                <div className="text-xs font-medium text-slate-500">{t('modules.jobExecucoesAdmin.colError')}</div>
                <pre className="max-h-64 overflow-auto whitespace-pre-wrap rounded-lg bg-[#0F1419] p-3 text-xs text-slate-300">
                  {detalhe.mensagemErro && detalhe.mensagemErro.length > 0 ? detalhe.mensagemErro : '—'}
                </pre>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export default JobExecucaoDetalhePage;
