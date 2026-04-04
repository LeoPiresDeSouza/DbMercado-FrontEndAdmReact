import React, { useCallback, useEffect, useRef } from 'react';
import { Images, Upload } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { authService } from '../../../auth/services/authService';
import { useMediaStore } from '../store/mediaStore';
import type { MediaItem, MediaTipo } from '../types/midiaTypes';
import { gerarThumbnailVideo } from '../utils/gerarThumbnailVideo';
import {
  excluirMidiaProduto,
  listarMidiasProduto,
  uploadMidiaProduto,
  urlMidiaAbsoluta,
  type MidiaProdutoDto,
} from '../services/midiaService';
import { MediaDropzone } from './MediaDropzone';
import { MediaGrid } from './MediaGrid';

const UPLOAD_CONCORRENCIA = 3;

async function executarComLimite<T>(
  itens: T[],
  limite: number,
  fn: (item: T) => Promise<void>
): Promise<void> {
  if (itens.length === 0) return;
  let idx = 0;
  const trabalhadores = Array.from({ length: Math.min(limite, itens.length) }, async () => {
    while (idx < itens.length) {
      const i = idx++;
      await fn(itens[i]!);
    }
  });
  await Promise.all(trabalhadores);
}

const sectionFieldset =
  'min-w-0 rounded-xl border border-[#2D3748] bg-[#141B2D] p-6 shadow-sm md:p-8';

const sectionHeadingClass =
  'flex w-full items-center gap-2 border-b border-orange-500/25 pb-4 text-xs font-semibold uppercase tracking-widest text-orange-400 mb-6';

function mapDtoParaItem(dto: MidiaProdutoDto, ordem: number): MediaItem {
  const tipo: MediaTipo = dto.tipo === 'video' ? 'video' : 'imagem';
  const urlAbs = urlMidiaAbsoluta(dto.url);
  const thumbAbs = dto.thumbnailUrl ? urlMidiaAbsoluta(dto.thumbnailUrl) : undefined;
  return {
    id: crypto.randomUUID(),
    tipo,
    previewUrl: tipo === 'imagem' ? urlAbs : thumbAbs ?? urlAbs,
    thumbnailUrl: thumbAbs,
    duracao: dto.duracao ?? undefined,
    progresso: 100,
    status: 'concluido',
    isPrincipal: dto.isPrincipal,
    ordem,
    serverId: String(dto.id),
    url: urlAbs,
  };
}

export type ProductMediaStudioProps = {
  /** `null` em criação; id numérico em edição (carrega mídias existentes). */
  produtoId?: number | null;
  disabled?: boolean;
};

export function ProductMediaStudio({
  produtoId = null,
  disabled,
}: ProductMediaStudioProps): React.ReactElement {
  const { t } = useTranslation('common');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const itens = useMediaStore((s) => s.itens);
  const adicionarItens = useMediaStore((s) => s.adicionarItens);
  const atualizarItem = useMediaStore((s) => s.atualizarItem);
  const removerItem = useMediaStore((s) => s.removerItem);
  const reordenar = useMediaStore((s) => s.reordenar);
  const definirPrincipal = useMediaStore((s) => s.definirPrincipal);
  const limparTudo = useMediaStore((s) => s.limparTudo);
  const substituirItens = useMediaStore((s) => s.substituirItens);

  useEffect(() => {
    let cancel = false;
    void (async () => {
      if (produtoId == null) {
        limparTudo();
        return;
      }
      try {
        const data = await listarMidiasProduto(produtoId);
        if (cancel) return;
        limparTudo();
        substituirItens(data.map((d, i) => mapDtoParaItem(d, i)));
      } catch {
        if (!cancel) substituirItens([]);
      }
    })();
    return () => {
      cancel = true;
    };
  }, [produtoId, limparTudo, substituirItens]);

  const processarArquivos = useCallback(
    async (files: File[]) => {
      await authService.ensureAccessTokenFreshIfNeeded();
      const novos: MediaItem[] = [];
      for (const file of files) {
        const isVid = file.type.startsWith('video');
        const id = crypto.randomUUID();
        const previewUrl = URL.createObjectURL(file);
        let thumbnailUrl: string | undefined;
        let duracao: number | undefined;
        if (isVid) {
          try {
            thumbnailUrl = await gerarThumbnailVideo(file);
            const v = document.createElement('video');
            v.preload = 'metadata';
            v.src = previewUrl;
            await new Promise<void>((resolve, reject) => {
              v.onloadedmetadata = () => resolve();
              v.onerror = () => reject(new Error('metadata'));
            });
            duracao = Number.isFinite(v.duration) ? v.duration : undefined;
          } catch {
            thumbnailUrl = undefined;
          }
        }
        novos.push({
          id,
          file,
          tipo: isVid ? 'video' : 'imagem',
          previewUrl,
          thumbnailUrl,
          duracao,
          progresso: 0,
          status: 'idle',
          isPrincipal: false,
          ordem: novos.length,
        });
      }
      if (novos.length === 0) return;
      adicionarItens(novos);

      const comFicheiro = novos.filter((n): n is MediaItem & { file: File } => Boolean(n.file));

      await executarComLimite(comFicheiro, UPLOAD_CONCORRENCIA, async (it) => {
        atualizarItem(it.id, { status: 'enviando', progresso: 0 });
        try {
          const r = await uploadMidiaProduto(it.file, it.duracao);
          const absoluto = urlMidiaAbsoluta(r.url);
          const thumbAbs = r.thumbnailUrl ? urlMidiaAbsoluta(r.thumbnailUrl) : undefined;
          atualizarItem(it.id, {
            status: 'concluido',
            progresso: 100,
            serverId: String(r.midiaId),
            url: absoluto,
            thumbnailUrl: thumbAbs ?? it.thumbnailUrl,
            previewUrl: it.tipo === 'imagem' ? absoluto : (thumbAbs ?? absoluto),
          });
        } catch (err: unknown) {
          console.warn('[ProductMediaStudio] uploadMidiaProduto falhou', it.file.name, err);
          atualizarItem(it.id, { status: 'erro', progresso: 0 });
        }
      });
    },
    [adicionarItens, atualizarItem]
  );

  const handleRemover = useCallback(
    async (id: string) => {
      const alvo = itens.find((x) => x.id === id);
      const sid = alvo?.serverId ? Number(alvo.serverId) : NaN;
      if (Number.isFinite(sid)) {
        try {
          await excluirMidiaProduto(sid);
        } catch {
          /* permanece no grid se exclusão falhar; utilizador pode tentar de novo */
        }
      }
      removerItem(id);
    },
    [itens, removerItem]
  );

  const handleLimparTudo = useCallback(async () => {
    for (const it of itens) {
      const sid = it.serverId ? Number(it.serverId) : NaN;
      if (Number.isFinite(sid)) {
        try {
          await excluirMidiaProduto(sid);
        } catch {
          /* ignore */
        }
      }
    }
    limparTudo();
  }, [itens, limparTudo]);

  return (
    <fieldset disabled={disabled} className={`${sectionFieldset} disabled:opacity-60`}>
      <legend className="sr-only">{t('modules.productsAdmin.sectionMedia')}</legend>
      <div className={sectionHeadingClass} aria-hidden="true">
        <Images size={16} className="shrink-0" aria-hidden />
        <span>{t('modules.productsAdmin.sectionMedia')}</span>
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <button
          type="button"
          disabled={disabled}
          onClick={() => fileInputRef.current?.click()}
          className="inline-flex items-center gap-2 rounded-md border border-[#2D3748] bg-[#141B2D] px-4 py-2 text-sm font-medium text-[#ADB5BD] shadow-sm transition-all hover:border-[#4A5568] hover:text-white focus:outline-none focus:ring-2 focus:ring-[rgba(13,110,253,0.3)] disabled:opacity-50"
        >
          <Upload size={14} aria-hidden />
          {t('modules.productsAdmin.mediaSelectFiles')}
        </button>
        <span className="text-xs text-[#718096]">{t('modules.productsAdmin.mediaOrDragHint')}</span>
      </div>

      <MediaDropzone onArquivos={(f) => void processarArquivos(f)} disabled={disabled} fileInputRef={fileInputRef} />

      {itens.length > 0 ? (
        <div className="mt-6">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-xs text-[#718096]">
              {itens.length}{' '}
              {itens.length === 1 ? t('modules.productsAdmin.mediaFileSingular') : t('modules.productsAdmin.mediaFilePlural')}
            </span>
            <button
              type="button"
              disabled={disabled}
              onClick={() => void handleLimparTudo()}
              className="text-xs text-[#718096] transition-colors hover:text-[#DC3545] disabled:opacity-50"
            >
              {t('modules.productsAdmin.mediaRemoveAll')}
            </button>
          </div>
          <MediaGrid
            itens={itens}
            disabled={disabled}
            onReordenar={reordenar}
            onRemover={(id) => void handleRemover(id)}
            onDefinirPrincipal={definirPrincipal}
          />
        </div>
      ) : null}
    </fieldset>
  );
}
