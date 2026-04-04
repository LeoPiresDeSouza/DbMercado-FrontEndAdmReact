import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { listarBackupsLogs, obterConteudoBackupLogs, type LogBackupArquivo } from '../services/appLogService';

export type LogBackupsPanelProps = {
  onVoltar: () => void;
};

export function LogBackupsPanel(props: LogBackupsPanelProps): React.ReactElement {
  const { onVoltar } = props;
  const { t } = useTranslation('common');
  const [lista, setLista] = useState<LogBackupArquivo[]>([]);
  const [carregandoLista, setCarregandoLista] = useState(true);
  const [selecionado, setSelecionado] = useState<string>('');
  const [conteudo, setConteudo] = useState<string | null>(null);
  const [carregandoConteudo, setCarregandoConteudo] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setCarregandoLista(true);
    void listarBackupsLogs()
      .then((l) => {
        if (!cancelled) {
          setLista(l);
          setSelecionado(l[0]?.nome ?? '');
        }
      })
      .catch(() => {
        if (!cancelled) {
          setErro(t('modules.logsAdmin.backupsLoadError'));
        }
      })
      .finally(() => {
        if (!cancelled) {
          setCarregandoLista(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [t]);

  useEffect(() => {
    if (!selecionado) {
      setConteudo(null);
      return;
    }
    let cancelled = false;
    setCarregandoConteudo(true);
    setConteudo(null);
    void obterConteudoBackupLogs(selecionado)
      .then((text) => {
        if (!cancelled) {
          setConteudo(text);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setConteudo(t('modules.logsAdmin.backupContentError'));
        }
      })
      .finally(() => {
        if (!cancelled) {
          setCarregandoConteudo(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [selecionado, t]);

  return (
    <div className="flex min-h-[480px] flex-col gap-4 rounded-xl border border-[#1e293b] bg-[#141B2D] p-4">
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={onVoltar}
          className="inline-flex items-center gap-2 rounded-lg border border-[#1e293b] bg-[#0F1419] px-3 py-2 text-sm text-slate-200 hover:bg-white/5"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden />
          {t('modules.logsAdmin.backupsBack')}
        </button>
        <h2 className="text-lg font-semibold text-slate-100">{t('modules.logsAdmin.backupsTitle')}</h2>
      </div>

      {erro ? <p className="text-sm text-amber-400">{erro}</p> : null}

      {carregandoLista ? (
        <div className="flex justify-center py-8 text-sky-400">
          <Loader2 className="h-8 w-8 animate-spin" aria-hidden />
        </div>
      ) : lista.length === 0 ? (
        <p className="text-sm text-slate-400">{t('modules.logsAdmin.backupsEmpty')}</p>
      ) : (
        <>
          <label className="flex flex-col gap-2 text-sm text-slate-300">
            <span>{t('modules.logsAdmin.backupsSelect')}</span>
            <select
              className="max-w-xl rounded-lg border border-[#1e293b] bg-[#0F1419] px-3 py-2 text-slate-100"
              value={selecionado}
              onChange={(e) => setSelecionado(e.target.value)}
            >
              {lista.map((f) => (
                <option key={f.nome} value={f.nome}>
                  {f.nome} ({f.tamanhoBytes} B)
                </option>
              ))}
            </select>
          </label>

          <div className="min-h-[280px] flex-1 rounded-lg border border-[#1e293b] bg-[#0F1419] p-3">
            {carregandoConteudo ? (
              <div className="flex justify-center py-12 text-sky-400">
                <Loader2 className="h-8 w-8 animate-spin" aria-hidden />
              </div>
            ) : (
              <pre className="max-h-[420px] overflow-auto font-mono text-xs leading-relaxed text-slate-200">
                {conteudo ?? ''}
              </pre>
            )}
          </div>
        </>
      )}
    </div>
  );
}
