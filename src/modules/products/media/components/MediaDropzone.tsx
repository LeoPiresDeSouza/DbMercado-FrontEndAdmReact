import React, { useCallback, useRef, useState } from 'react';
import { UploadCloud } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export type MediaDropzoneProps = {
  onArquivos: (files: File[]) => void;
  disabled?: boolean;
  /** Quando definido, permite acionar o seletor a partir do botão externo (ex.: «Selecionar arquivos»). */
  fileInputRef?: React.RefObject<HTMLInputElement | null>;
};

export function MediaDropzone({ onArquivos, disabled, fileInputRef }: MediaDropzoneProps): React.ReactElement {
  const { t } = useTranslation('common');
  const inputRef = useRef<HTMLInputElement>(null);
  const refAtivo = fileInputRef ?? inputRef;
  const [hover, setHover] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const ativo = dragOver || hover;

  const processarLista = useCallback(
    (list: FileList | null) => {
      if (!list?.length || disabled) return;
      onArquivos(Array.from(list));
    },
    [disabled, onArquivos]
  );

  return (
    <div
      onDragEnter={(e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragOver(true);
      }}
      onDragOver={(e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragOver(true);
      }}
      onDragLeave={(e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.currentTarget.contains(e.relatedTarget as Node)) return;
        setDragOver(false);
      }}
      onDrop={(e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragOver(false);
        processarLista(e.dataTransfer.files);
      }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => {
        setHover(false);
        setDragOver(false);
      }}
      className={`flex min-h-[140px] cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-4 py-6 transition-all duration-150 ${
        ativo
          ? 'scale-[1.01] border-[#0D6EFD] bg-[#0D6EFD]/10'
          : 'border-[#2D3748] bg-[#0F1419] hover:border-[#0D6EFD] hover:bg-[#0D6EFD]/5'
      }`}
      role="presentation"
      onClick={() => {
        if (!disabled) refAtivo.current?.click();
      }}
    >
      <input
        ref={refAtivo}
        type="file"
        className="hidden"
        accept="image/*,video/*"
        multiple
        disabled={disabled}
        onChange={(e) => {
          processarLista(e.target.files);
          e.target.value = '';
        }}
      />
      <UploadCloud size={32} className={ativo ? 'text-[#0D6EFD]' : 'text-[#2D3748]'} aria-hidden />
      <p className={`mt-2 text-sm ${ativo ? 'text-[#0D6EFD]' : 'text-[#718096]'}`}>
        {t('modules.productsAdmin.mediaDropzoneTitle')}
      </p>
      <p className="mt-1 text-center text-xs text-[#4A5568]">{t('modules.productsAdmin.mediaDropzoneHint')}</p>
    </div>
  );
}
