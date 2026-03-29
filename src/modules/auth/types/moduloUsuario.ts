export interface PermissaoUsuarioDto {
  permissaoId: number;
  permissao: string;
}

export interface FuncionalidadeUsuarioDto {
  funcionalidadeId: number;
  nomeNormalizado: string;
  nomeExibicao: string;
  ordemExibicao: number;
  icone: string;
  permissoes: PermissaoUsuarioDto[];
}

export interface ModuloUsuarioDto {
  moduloId: number;
  nomeNormalizado: string;
  nomeExibicao: string;
  ordemExibicao: number;
  icone: string;
  funcionalidades: FuncionalidadeUsuarioDto[];
}
