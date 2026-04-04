import type { ModuloUsuarioDto } from '../../auth/types/moduloUsuario';

export const CONTROLE_LOGS_FUNCIONALIDADE = 'controledelogs' as const;

export const ControleLogsPermissao = {
  acessar: 'acessar',
  excluirEntrada: 'excluirEntrada',
  limparLog: 'limparLog',
  descarregarParaDisco: 'descarregarParaDisco',
} as const;

export type ControleLogsPermissaoNome = (typeof ControleLogsPermissao)[keyof typeof ControleLogsPermissao];

/**
 * Verifica se o usuário tem a permissão na funcionalidade `controledelogs` (estrutura vinda de `/api/Modulo/modulosUsuario`).
 */
export function usuarioTemPermissaoControleLogs(
  modulos: ModuloUsuarioDto[] | null,
  permissao: ControleLogsPermissaoNome
): boolean {
  if (modulos == null || modulos.length === 0) {
    return false;
  }
  for (const m of modulos) {
    const f = m.funcionalidades.find((x) => x.nomeNormalizado === CONTROLE_LOGS_FUNCIONALIDADE);
    if (f?.permissoes.some((p) => p.permissao === permissao)) {
      return true;
    }
  }
  return false;
}
