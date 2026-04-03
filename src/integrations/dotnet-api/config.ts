/**
 * API .NET principal (administrativo).
 * `VITE_DOTNET_API_BASE_URL` ou `VITE_API_BASE_URL` (`.env`).
 */
export const DOTNET_API_BASE_URL: string =
  import.meta.env.VITE_DOTNET_API_BASE_URL ??
  import.meta.env.VITE_API_BASE_URL ??
  'http://localhost:5046';

/** @deprecated Use `DOTNET_API_BASE_URL`. */
export const API_BASE_URL = DOTNET_API_BASE_URL;
