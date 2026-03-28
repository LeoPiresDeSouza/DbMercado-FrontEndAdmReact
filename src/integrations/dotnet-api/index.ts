/**
 * Integração com backend .NET Core — configuração e cliente administrativo pré-configurado.
 * Camada de composição (acopla `authService` ao `HttpTokenProvider`).
 */
export { API_BASE_URL, DOTNET_API_BASE_URL } from './config';
export { adminDotnetApiClient } from './adminDotnetApiClient';
