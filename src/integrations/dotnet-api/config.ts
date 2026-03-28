/**
 * API .NET principal (administrativo).
 * Preferir `DOTNET_API_BASE_URL`. `REACT_APP_API_BASE_URL` mantém compatibilidade com builds antigos.
 */
export const DOTNET_API_BASE_URL: string =
  process.env.REACT_APP_DOTNET_API_BASE_URL ??
  process.env.REACT_APP_API_BASE_URL ??
  'http://localhost:5046';

/** @deprecated Use `DOTNET_API_BASE_URL`. */
export const API_BASE_URL = DOTNET_API_BASE_URL;
