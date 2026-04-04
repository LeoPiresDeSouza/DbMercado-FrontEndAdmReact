import { z } from 'zod';
import type { MediaItem } from '../types/midiaTypes';
import { adminDotnetApiClient } from '../../../../integrations/dotnet-api/adminDotnetApiClient';
import { DOTNET_API_BASE_URL } from '../../../../integrations/dotnet-api/config';
import { generateCorrelationId } from '../../../../shared/services/http/correlationId';
import { normalizeHttpError } from '../../../../shared/services/http/normalizeError';
import { deepCamelCaseKeys } from '../../../../shared/utils/deepCamelCaseKeys';
import { parseJsonWithSchema } from '../../../../shared/utils/parseJson';
import { readResponseJsonUnknown } from '../../../../shared/utils/readJson';

const uploadResponseSchema = z.object({
  midiaId: z.coerce.number(),
  url: z.string(),
  thumbnailUrl: z.string().nullable().optional(),
});

const midiaItemSchema = z.object({
  id: z.coerce.number(),
  url: z.string(),
  thumbnailUrl: z.string().nullable().optional(),
  tipo: z.string(),
  ordem: z.number(),
  isPrincipal: z.boolean(),
  duracao: z.coerce.number().nullable().optional(),
  status: z.string(),
});

const listSchema = z.array(midiaItemSchema);

export type MidiaProdutoDto = z.infer<typeof midiaItemSchema>;

export function urlMidiaAbsoluta(urlRelativaOuAbsoluta: string): string {
  if (urlRelativaOuAbsoluta.startsWith('http://') || urlRelativaOuAbsoluta.startsWith('https://')) {
    return urlRelativaOuAbsoluta;
  }
  if (urlRelativaOuAbsoluta.startsWith('/')) {
    return `${DOTNET_API_BASE_URL.replace(/\/$/, '')}${urlRelativaOuAbsoluta}`;
  }
  return urlRelativaOuAbsoluta;
}

export async function uploadMidiaProduto(arquivo: File, duracaoSegundos?: number): Promise<z.infer<typeof uploadResponseSchema>> {
  const correlationId = generateCorrelationId();
  const fd = new FormData();
  fd.set('arquivo', arquivo, arquivo.name);
  if (duracaoSegundos !== undefined && Number.isFinite(duracaoSegundos)) {
    fd.set('duracao', String(duracaoSegundos));
  }
  const response = await adminDotnetApiClient.request('/api/produtos/midia/upload', {
    method: 'POST',
    body: fd,
    correlationId,
  });
  const raw = await readResponseJsonUnknown(response);
  if (!response.ok) {
    throw normalizeHttpError(response, 'dotnet', correlationId, raw);
  }
  return parseJsonWithSchema(uploadResponseSchema, deepCamelCaseKeys(raw));
}

export async function listarMidiasProduto(produtoId: number): Promise<MidiaProdutoDto[]> {
  const correlationId = generateCorrelationId();
  const response = await adminDotnetApiClient.request(`/api/produtos/${produtoId}/midias`, {
    method: 'GET',
    correlationId,
  });
  const raw = await readResponseJsonUnknown(response);
  if (!response.ok) {
    throw normalizeHttpError(response, 'dotnet', correlationId, raw);
  }
  return parseJsonWithSchema(listSchema, deepCamelCaseKeys(raw));
}

export async function associarMidiasProduto(
  produtoId: number,
  itens: Array<{ midiaId: number; isPrincipal: boolean }>
): Promise<void> {
  const correlationId = generateCorrelationId();
  const response = await adminDotnetApiClient.request(`/api/produtos/${produtoId}/midias`, {
    method: 'POST',
    body: JSON.stringify({ itens }),
    correlationId,
  });
  if (!response.ok) {
    const raw = await readResponseJsonUnknown(response);
    throw normalizeHttpError(response, 'dotnet', correlationId, raw);
  }
}

export function montarPayloadAssociarMidias(
  itens: MediaItem[]
): Array<{ midiaId: number; isPrincipal: boolean }> {
  return itens
    .filter((m) => m.status === 'concluido' && m.serverId)
    .sort((a, b) => a.ordem - b.ordem)
    .map((m) => ({
      midiaId: Number(m.serverId),
      isPrincipal: m.tipo === 'imagem' && m.isPrincipal,
    }));
}

/**
 * Bloqueia gravar só durante envio activo (há bytes em trânsito) ou `processando`.
 * Não bloqueia `idle`, `enviando` com 0% (fila / XHR que não arrancou) nem 100% — evita trancar o formulário.
 */
export function temMidiaAguardandoUpload(itens: MediaItem[]): boolean {
  return itens.some((m) => {
    if (m.status === 'processando') return true;
    if (m.status === 'enviando' && m.progresso > 0 && m.progresso < 100) return true;
    return false;
  });
}

/**
 * Há linhas na grelha que não estão em «erro», mas nenhuma entrou no payload (falta `concluido` + `serverId`).
 * Evita gravar o produto com 201 e zero `midias` no JSON sem o utilizador perceber.
 */
export function temMidiaNaoPersistivelNaGrelha(itens: MediaItem[]): boolean {
  if (itens.length === 0) {
    return false;
  }
  return montarPayloadAssociarMidias(itens).length === 0 && itens.some((m) => m.status !== 'erro');
}

export async function excluirMidiaProduto(midiaId: number): Promise<void> {
  const correlationId = generateCorrelationId();
  const response = await adminDotnetApiClient.request(`/api/produtos/midia/${midiaId}`, {
    method: 'DELETE',
    correlationId,
  });
  if (!response.ok && response.status !== 404) {
    const raw = await readResponseJsonUnknown(response);
    throw normalizeHttpError(response, 'dotnet', correlationId, raw);
  }
}
