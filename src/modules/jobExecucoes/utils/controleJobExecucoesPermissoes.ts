import type { ModuloUsuarioDto } from '../../auth/types/moduloUsuario';

export const JOB_EXECUCOES_FUNCIONALIDADE = 'execucoesdejobs' as const;

export const JobExecucoesPermissao = {
  acessar: 'acessar',
} as const;

export type JobExecucoesPermissaoNome = (typeof JobExecucoesPermissao)[keyof typeof JobExecucoesPermissao];

export function usuarioTemPermissaoJobExecucoes(
  modulos: ModuloUsuarioDto[] | null,
  permissao: JobExecucoesPermissaoNome
): boolean {
  if (modulos == null || modulos.length === 0) {
    return false;
  }
  for (const m of modulos) {
    const f = m.funcionalidades.find((x) => x.nomeNormalizado === JOB_EXECUCOES_FUNCIONALIDADE);
    if (f?.permissoes.some((p) => p.permissao === permissao)) {
      return true;
    }
  }
  return false;
}
