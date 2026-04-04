import React from 'react';
import { AlertCircle, GripVertical, Play, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { MediaItem } from '../types/midiaTypes';

function formatarDuracao(s?: number): string {
  if (s == null || !Number.isFinite(s)) return '';
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, '0')}`;
}

export type MediaCardProps = {
  item: MediaItem;
  disabled?: boolean;
  onRemover: () => void;
  onDefinirPrincipal: () => void;
  dragHandleProps?: React.ButtonHTMLAttributes<HTMLButtonElement> & {
    ref?: React.Ref<HTMLButtonElement | null>;
  };
};

export function MediaCard({
  item,
  disabled,
  onRemover,
  onDefinirPrincipal,
  dragHandleProps,
}: MediaCardProps): React.ReactElement {
  const { t } = useTranslation('common');
  const { ref: dragHandleRef, ...dragHandleRest } = dragHandleProps ?? {};
  const erro = item.status === 'erro';
  const enviando = item.status === 'enviando';

  const capa =
    item.tipo === 'video' ? (
      item.thumbnailUrl ? (
        <img src={item.thumbnailUrl} alt="" className="h-full w-full object-cover" />
      ) : (
        <video
          src={item.previewUrl}
          className="h-full w-full object-cover"
          muted
          playsInline
          preload="metadata"
        />
      )
    ) : (
      <img src={item.previewUrl} alt="" className="h-full w-full object-cover" />
    );

  return (
    <div
      className={`relative aspect-square overflow-hidden rounded-xl border bg-[#0F1419] transition-transform duration-150 ${
        erro ? 'border-[#DC3545]/50 bg-[#DC3545]/5' : 'border-[#2D3748]'
      } group cursor-grab active:cursor-grabbing`}
    >
      {!erro ? capa : null}

      {item.tipo === 'video' && !erro ? (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <Play size={28} className="text-white/90 drop-shadow-md" aria-hidden />
        </div>
      ) : null}

      <div className="pointer-events-none absolute inset-0 bg-black/0 transition-colors duration-150 group-hover:bg-black/40" />

      {dragHandleProps ? (
        <div className="absolute left-1 top-1/2 z-10 -translate-y-1/2 opacity-0 transition-opacity duration-150 group-hover:opacity-100">
          <button
            type="button"
            className="rounded bg-[#0F1419]/90 p-1 text-[#4A5568] hover:text-[#ADB5BD]"
            aria-label={t('modules.productsAdmin.mediaReorderAria')}
            {...dragHandleRest}
            ref={dragHandleRef as React.Ref<HTMLButtonElement> | undefined}
          >
            <GripVertical size={14} aria-hidden />
          </button>
        </div>
      ) : null}

      <div className="pointer-events-none absolute left-1.5 top-1.5">
        <span
          className={`rounded px-1.5 py-0.5 text-[10px] font-medium ${
            item.tipo === 'video'
              ? 'bg-[#7C3AED]/20 text-[#A78BFA]'
              : 'bg-[#0D6EFD]/20 text-[#93C5FD]'
          }`}
        >
          {item.tipo === 'video' ? t('modules.productsAdmin.mediaBadgeVideo') : t('modules.productsAdmin.mediaBadgeImagem')}
        </span>
      </div>

      {item.tipo === 'imagem' && item.isPrincipal ? (
        <div className="pointer-events-none absolute bottom-1.5 left-1.5 rounded bg-[#0D6EFD] px-1.5 py-0.5 text-[10px] font-medium text-white">
          {t('modules.productsAdmin.mediaBadgePrincipal')}
        </div>
      ) : null}

      {item.tipo === 'video' && item.duracao !== undefined ? (
        <div className="pointer-events-none absolute bottom-1.5 right-1.5 rounded bg-black/60 px-1.5 py-0.5 text-[10px] text-white">
          {formatarDuracao(item.duracao)}
        </div>
      ) : null}

      <div className="absolute right-1.5 top-1.5 z-10 opacity-0 transition-opacity duration-150 group-hover:opacity-100">
        <button
          type="button"
          disabled={disabled}
          onClick={onRemover}
          className="rounded-full bg-[#0F1419]/90 p-1 text-[#DC3545] transition-colors hover:bg-[#DC3545]/20 disabled:opacity-50"
          aria-label={t('modules.productsAdmin.mediaRemoveAria')}
        >
          <X size={12} aria-hidden />
        </button>
      </div>

      {item.tipo === 'imagem' ? (
        <div className="absolute inset-x-0 bottom-0 z-10 flex justify-center pb-1.5 opacity-0 transition-opacity duration-150 group-hover:opacity-100">
          <button
            type="button"
            disabled={disabled}
            onClick={onDefinirPrincipal}
            className="rounded bg-[#0F1419]/90 px-2 py-0.5 text-[10px] text-[#ADB5BD] transition-colors hover:text-white disabled:opacity-50"
          >
            {t('modules.productsAdmin.mediaSetPrincipal')}
          </button>
        </div>
      ) : null}

      {enviando ? (
        <div className="absolute inset-x-0 bottom-0 h-[3px] bg-[#1E293B]">
          <div
            className="h-full bg-[#0D6EFD] transition-[width] duration-300 ease-out"
            style={{ width: `${item.progresso}%` }}
          />
        </div>
      ) : null}

      {erro ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 bg-[#0F1419]/90">
          <AlertCircle size={16} className="text-[#DC3545]" aria-hidden />
          <span className="text-center text-[10px] text-[#DC3545] px-2">{t('modules.productsAdmin.mediaUploadError')}</span>
        </div>
      ) : null}
    </div>
  );
}
