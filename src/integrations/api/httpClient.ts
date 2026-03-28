import { adminDotnetApiClient } from '../dotnet-api/adminDotnetApiClient';

/**
 * Compatível com o helper legado: usa o cliente .NET enterprise (timeout, retry, Bearer, etc.).
 */
export function apiFetch(path: string, options: RequestInit = {}): Promise<Response> {
  return adminDotnetApiClient.request(path, options);
}
