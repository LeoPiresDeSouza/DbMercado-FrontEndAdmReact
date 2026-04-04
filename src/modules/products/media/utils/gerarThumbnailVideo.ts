/**
 * Frame em t ≈ 1 s (nunca t=0 — evita frame preto).
 */
export async function gerarThumbnailVideo(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    const url = URL.createObjectURL(file);
    video.src = url;
    video.preload = 'metadata';
    video.muted = true;

    video.onloadedmetadata = () => {
      const t = video.duration > 0 ? Math.min(1, video.duration * 0.1) : 1;
      video.currentTime = Number.isFinite(t) ? t : 1;
    };

    video.onseeked = () => {
      try {
        const canvas = document.createElement('canvas');
        const w = video.videoWidth || 320;
        const h = video.videoHeight || 180;
        const scale = w > 320 ? 320 / w : 1;
        canvas.width = Math.round(w * scale);
        canvas.height = Math.round(h * scale);
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          URL.revokeObjectURL(url);
          reject(new Error('Canvas não disponível'));
          return;
        }
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        URL.revokeObjectURL(url);
        resolve(canvas.toDataURL('image/jpeg', 0.8));
      } catch (e) {
        URL.revokeObjectURL(url);
        reject(e instanceof Error ? e : new Error('Falha ao gerar thumbnail'));
      }
    };

    video.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Erro ao processar vídeo'));
    };
  });
}
