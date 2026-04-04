import { z } from 'zod';
import { adminDotnetApiClient } from '../../../integrations/dotnet-api/adminDotnetApiClient';
import { generateCorrelationId } from '../../../shared/services/http/correlationId';
import { normalizeHttpError } from '../../../shared/services/http/normalizeError';
import { deepCamelCaseKeys } from '../../../shared/utils/deepCamelCaseKeys';
import { parseJsonWithSchema } from '../../../shared/utils/parseJson';
import { readResponseJsonUnknown } from '../../../shared/utils/readJson';

const appLogGridRowSchema = z.object({
  id: z.coerce.number(),
  createdAt: z.string(),
  level: z.string(),
  category: z.string(),
  message: z.string(),
  hasException: z.boolean(),
  userName: z.string().nullable().optional(),
  path: z.string().nullable().optional(),
  method: z.string().nullable().optional(),
});

const appLogGridResultSchema = z.object({
  rows: z.array(appLogGridRowSchema),
  rowCount: z.number(),
});

export type AppLogGridRow = z.infer<typeof appLogGridRowSchema>;

const appLogDetalheSchema = z.object({
  id: z.coerce.number(),
  category: z.string(),
  level: z.string(),
  message: z.string(),
  exception: z.string().nullable().optional(),
  errorCode: z.string().nullable().optional(),
  traceId: z.string().nullable().optional(),
  userId: z.string().nullable().optional(),
  userName: z.string().nullable().optional(),
  path: z.string().nullable().optional(),
  method: z.string().nullable().optional(),
  ip: z.string().nullable().optional(),
  userAgent: z.string().nullable().optional(),
  createdAt: z.string(),
});

export type AppLogDetalhe = z.infer<typeof appLogDetalheSchema>;

const logLimpezaResultSchema = z.object({
  registrosExcluidos: z.number(),
  arquivoBackup: z.string().nullable().optional(),
});

const logBackupArquivoSchema = z.object({
  nome: z.string(),
  tamanhoBytes: z.coerce.number(),
  dataCriacao: z.string(),
});

export type LogBackupArquivo = z.infer<typeof logBackupArquivoSchema>;

export interface AppLogGridQueryBody {
  startRow: number;
  endRow: number;
  sortModel: Array<{ colId: string; sort?: string | null }>;
  dataInicio?: string | null;
  dataFim?: string | null;
  somenteComExcecao: boolean;
  levels?: string[] | null;
}

export async function consultarAppLogsGrid(
  body: AppLogGridQueryBody
): Promise<{ rows: AppLogGridRow[]; rowCount: number }> {
  const correlationId = generateCorrelationId();
  const response = await adminDotnetApiClient.request('/api/app-logs/consultas/grid', {
    method: 'POST',
    body: JSON.stringify({
      startRow: body.startRow,
      endRow: body.endRow,
      sortModel: body.sortModel,
      dataInicio: body.dataInicio ?? null,
      dataFim: body.dataFim ?? null,
      somenteComExcecao: body.somenteComExcecao,
      levels: body.levels && body.levels.length > 0 ? body.levels : null,
    }),
    correlationId,
  });
  const raw = await readResponseJsonUnknown(response);
  if (!response.ok) {
    throw normalizeHttpError(response, 'dotnet', correlationId, raw);
  }
  return parseJsonWithSchema(appLogGridResultSchema, deepCamelCaseKeys(raw));
}

export async function obterAppLogDetalhe(id: number): Promise<AppLogDetalhe> {
  const correlationId = generateCorrelationId();
  const response = await adminDotnetApiClient.request(`/api/app-logs/${id}`, {
    method: 'GET',
    correlationId,
  });
  const raw = await readResponseJsonUnknown(response);
  if (!response.ok) {
    throw normalizeHttpError(response, 'dotnet', correlationId, raw);
  }
  return parseJsonWithSchema(appLogDetalheSchema, deepCamelCaseKeys(raw));
}

export async function excluirAppLog(id: number): Promise<void> {
  const correlationId = generateCorrelationId();
  const response = await adminDotnetApiClient.request(`/api/app-logs/${id}`, {
    method: 'DELETE',
    correlationId,
  });
  if (response.status === 204) {
    return;
  }
  const raw = await readResponseJsonUnknown(response);
  throw normalizeHttpError(response, 'dotnet', correlationId, raw);
}

export async function executarLimpezaLogs(): Promise<z.infer<typeof logLimpezaResultSchema>> {
  const correlationId = generateCorrelationId();
  const response = await adminDotnetApiClient.request('/api/app-logs/limpeza', {
    method: 'POST',
    correlationId,
  });
  const raw = await readResponseJsonUnknown(response);
  if (!response.ok) {
    throw normalizeHttpError(response, 'dotnet', correlationId, raw);
  }
  return parseJsonWithSchema(logLimpezaResultSchema, deepCamelCaseKeys(raw));
}

export async function listarBackupsLogs(): Promise<LogBackupArquivo[]> {
  const correlationId = generateCorrelationId();
  const response = await adminDotnetApiClient.request('/api/app-logs/backups', {
    method: 'GET',
    correlationId,
  });
  const raw = await readResponseJsonUnknown(response);
  if (!response.ok) {
    throw normalizeHttpError(response, 'dotnet', correlationId, raw);
  }
  const list = z.array(logBackupArquivoSchema).parse(deepCamelCaseKeys(raw));
  return list;
}

export async function obterConteudoBackupLogs(nomeArquivo: string): Promise<string> {
  const correlationId = generateCorrelationId();
  const enc = encodeURIComponent(nomeArquivo);
  const response = await adminDotnetApiClient.request(`/api/app-logs/backups/${enc}`, {
    method: 'GET',
    correlationId,
  });
  if (!response.ok) {
    const raw = await readResponseJsonUnknown(response);
    throw normalizeHttpError(response, 'dotnet', correlationId, raw);
  }
  return response.text();
}
