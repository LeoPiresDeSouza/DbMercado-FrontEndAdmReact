import { createApiClient, type HttpTokenProvider } from '../../shared/services/http';
import { authService } from '../../modules/auth/services/authService';
import { PYTHON_AI_API_BASE_URL } from './config';

/** Mesmo JWT do painel admin, se o serviço Python validar o token emitido pelo .NET. */
const pythonAiTokenProvider: HttpTokenProvider = {
  getAccessToken: () => authService.getAuthToken(),
  refreshAccessToken: () => authService.refreshAccessTokenFromApi(),
  onAuthFailure: () => {
    authService.logout();
    window.location.assign('/login');
  },
};

/**
 * Cliente HTTP para APIs Python (IA). Rotas públicas podem ser adicionadas em `publicPathPrefixes`.
 */
export const adminPythonAiApiClient = createApiClient({
  baseUrl: PYTHON_AI_API_BASE_URL,
  backendId: 'python-ai',
  tokenProvider: pythonAiTokenProvider,
  /** Ex.: health check sem JWT — descomente quando existir rota pública. */
  publicPathPrefixes: [],
});
