import { z } from 'zod';
import { adminDotnetApiClient } from '../../../integrations/dotnet-api/adminDotnetApiClient';
import { generateCorrelationId } from '../../../shared/services/http/correlationId';
import { normalizeHttpError } from '../../../shared/services/http/normalizeError';
import { deepCamelCaseKeys } from '../../../shared/utils/deepCamelCaseKeys';
import { parseJsonWithSchema } from '../../../shared/utils/parseJson';
import { readResponseJsonUnknown } from '../../../shared/utils/readJson';

const jobExecucaoGridRowSchema = z.object({
  id: z.coerce.number(),
  fireInstanceId: z.string(),
  jobNome: z.string(),
  jobGrupo: z.string(),
  triggerNome: z.string(),
  triggerGrupo: z.string(),
  inicioUtc: z.string(),
  fimUtc: z.string().nullable().optional(),
  duracaoMs: z.coerce.number().nullable().optional(),
  sucesso: z.boolean().nullable().optional(),
  mensagemErro: z.string().nullable().optional(),
});

const jobExecucaoGridResultSchema = z.object({
  rows: z.array(jobExecucaoGridRowSchema),
  rowCount: z.number(),
});

export type JobExecucaoGridRow = z.infer<typeof jobExecucaoGridRowSchema>;

const jobExecucaoDetalheSchema = jobExecucaoGridRowSchema;

export type JobExecucaoDetalhe = z.infer<typeof jobExecucaoDetalheSchema>;

export interface JobExecucaoGridQueryBody {
  startRow: number;
  endRow: number;
  sortModel: Array<{ colId: string; sort?: string | null }>;
  dataInicio?: string | null;
  dataFim?: string | null;
  jobNome?: string | null;
  resultadoFiltro?: string | null;
}

export async function consultarJobExecucoesGrid(
  body: JobExecucaoGridQueryBody
): Promise<{ rows: JobExecucaoGridRow[]; rowCount: number }> {
  const correlationId = generateCorrelationId();
  const response = await adminDotnetApiClient.request('/api/job-execucoes/consultas/grid', {
    method: 'POST',
    body: JSON.stringify({
      startRow: body.startRow,
      endRow: body.endRow,
      sortModel: body.sortModel,
      dataInicio: body.dataInicio ?? null,
      dataFim: body.dataFim ?? null,
      jobNome: body.jobNome?.trim() ? body.jobNome.trim() : null,
      resultadoFiltro: body.resultadoFiltro?.trim() ? body.resultadoFiltro.trim() : null,
    }),
    correlationId,
  });
  const raw = await readResponseJsonUnknown(response);
  if (!response.ok) {
    throw normalizeHttpError(response, 'dotnet', correlationId, raw);
  }
  return parseJsonWithSchema(jobExecucaoGridResultSchema, deepCamelCaseKeys(raw));
}

export async function obterJobExecucaoDetalhe(id: number): Promise<JobExecucaoDetalhe> {
  const correlationId = generateCorrelationId();
  const response = await adminDotnetApiClient.request(`/api/job-execucoes/${id}`, {
    method: 'GET',
    correlationId,
  });
  const raw = await readResponseJsonUnknown(response);
  if (!response.ok) {
    throw normalizeHttpError(response, 'dotnet', correlationId, raw);
  }
  return parseJsonWithSchema(jobExecucaoDetalheSchema, deepCamelCaseKeys(raw));
}
