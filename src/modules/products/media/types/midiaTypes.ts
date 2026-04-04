export type MediaTipo = 'imagem' | 'video';

export type MediaStatus = 'idle' | 'enviando' | 'processando' | 'concluido' | 'erro';

export interface MediaItem {
  id: string;
  file?: File;
  tipo: MediaTipo;
  previewUrl: string;
  thumbnailUrl?: string;
  duracao?: number;
  progresso: number;
  status: MediaStatus;
  isPrincipal: boolean;
  ordem: number;
  serverId?: string;
  url?: string;
}
