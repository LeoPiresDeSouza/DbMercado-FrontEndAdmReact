import { QueryClient } from '@tanstack/react-query';

/**
 * Instância única do QueryClient (também usada fora de React, ex.: `onAuthFailure` do HTTP client).
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      gcTime: 5 * 60_000,
      refetchOnWindowFocus: true,
      retry: 1,
    },
    mutations: {
      retry: 0,
    },
  },
});
