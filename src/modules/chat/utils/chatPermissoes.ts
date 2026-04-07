import type { ModuloUsuarioDto } from '../../auth/types/moduloUsuario';

export const CHAT_MULTILINGUE_FUNCIONALIDADE = 'chatmultilingue' as const;

export const ChatMultilinguePermissao = {
  acessar: 'acessar',
} as const;

export type ChatMultilinguePermissaoNome =
  (typeof ChatMultilinguePermissao)[keyof typeof ChatMultilinguePermissao];

/**
 * Funcionalidade `chatmultilingue` (módulo Administração), estrutura de `/api/Modulo/modulosUsuario`.
 */
export function usuarioTemPermissaoChatMultilingue(
  modulos: ModuloUsuarioDto[] | null,
  permissao: ChatMultilinguePermissaoNome
): boolean {
  if (modulos == null || modulos.length === 0) {
    return false;
  }
  for (const m of modulos) {
    const f = m.funcionalidades.find(
      (x) => x.nomeNormalizado === CHAT_MULTILINGUE_FUNCIONALIDADE
    );
    if (f?.permissoes.some((p) => p.permissao === permissao)) {
      return true;
    }
  }
  return false;
}
