import { z } from 'zod';
import { adminDotnetApiClient } from '../../../integrations/dotnet-api/adminDotnetApiClient';
import { generateCorrelationId } from '../../../shared/services/http/correlationId';
import { normalizeHttpError } from '../../../shared/services/http/normalizeError';
import { deepCamelCaseKeys } from '../../../shared/utils/deepCamelCaseKeys';
import { parseJsonWithSchema } from '../../../shared/utils/parseJson';
import { readResponseJsonUnknown } from '../../../shared/utils/readJson';
import type { CategoriaTreeNode } from '../types/categoriaTypes';

const categoriaTreeNodeSchema: z.ZodType<CategoriaTreeNode> = z.lazy(() =>
  z.object({
    id: z.coerce.number(),
    nome: z.string(),
    slug: z.string(),
    descricao: z.string().nullable().optional(),
    categoriaPaiId: z.coerce.number().nullable().optional(),
    nivel: z.coerce.number(),
    ativo: z.boolean(),
    subcategorias: z.array(categoriaTreeNodeSchema),
  })
);

const arvoreSchema = z.array(categoriaTreeNodeSchema);

export async function listarArvoreCategoriasProduto(): Promise<CategoriaTreeNode[]> {
  const correlationId = generateCorrelationId();
  const response = await adminDotnetApiClient.request('/api/categorias-produto', {
    method: 'GET',
    correlationId,
  });
  const raw = await readResponseJsonUnknown(response);
  if (!response.ok) {
    throw normalizeHttpError(response, 'dotnet', correlationId, raw);
  }
  return parseJsonWithSchema(arvoreSchema, deepCamelCaseKeys(raw));
}
