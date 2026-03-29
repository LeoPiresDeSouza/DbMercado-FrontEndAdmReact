import { z } from 'zod';
import { adminDotnetApiClient } from '../../../integrations/dotnet-api/adminDotnetApiClient';
import { generateCorrelationId } from '../../../shared/services/http/correlationId';
import { isNormalizedHttpError } from '../../../shared/services/http';
import { normalizeHttpError } from '../../../shared/services/http/normalizeError';
import { deepCamelCaseKeys } from '../../../shared/utils/deepCamelCaseKeys';
import { parseJsonWithSchema } from '../../../shared/utils/parseJson';
import { readResponseJsonUnknown } from '../../../shared/utils/readJson';
import type { ModuloUsuarioDto } from '../types/moduloUsuario';

const permissaoUsuarioResponseSchema = z.object({
  permissaoId: z.coerce.number(),
  permissao: z.string(),
});

const funcionalidadeUsuarioResponseSchema = z.object({
  funcionalidadeId: z.coerce.number(),
  nomeNormalizado: z.string(),
  nomeExibicao: z.string(),
  ordemExibicao: z.coerce.number(),
  icone: z.string(),
  permissoes: z.array(permissaoUsuarioResponseSchema),
});

const moduloUsuarioResponseSchema = z.object({
  moduloId: z.coerce.number(),
  nomeNormalizado: z.string(),
  nomeExibicao: z.string(),
  ordemExibicao: z.coerce.number(),
  icone: z.string(),
  funcionalidades: z.array(funcionalidadeUsuarioResponseSchema),
});

const listaModulosSchema = z.array(moduloUsuarioResponseSchema);

/**
 * Estrutura de módulos/funcionalidades/permissões do usuário (API administrativa).
 */
export async function fetchModulosUsuario(identity: string): Promise<ModuloUsuarioDto[]> {
  const q = encodeURIComponent(identity);
  const path = `/api/Modulo/modulosUsuario?usuario=${q}`;
  const correlationId = generateCorrelationId();
  try {
    const response = await adminDotnetApiClient.request(path, { method: 'GET', correlationId });
    const raw = await readResponseJsonUnknown(response);
    if (response.status === 404) {
      return [];
    }
    if (!response.ok) {
      throw normalizeHttpError(response, 'dotnet', correlationId, raw);
    }
    return parseJsonWithSchema(listaModulosSchema, deepCamelCaseKeys(raw)) as ModuloUsuarioDto[];
  } catch (error: unknown) {
    if (isNormalizedHttpError(error) && error.status === 404) {
      return [];
    }
    throw error;
  }
}

export async function tryLoadModulosUsuario(identity: string): Promise<ModuloUsuarioDto[]> {
  try {
    return await fetchModulosUsuario(identity);
  } catch (error: unknown) {
    if (isNormalizedHttpError(error) && (error.status === 401 || error.status === 403)) {
      throw error;
    }
    return [];
  }
}
