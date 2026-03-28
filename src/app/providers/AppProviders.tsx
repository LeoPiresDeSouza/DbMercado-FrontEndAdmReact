import React from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { AdminRealtimeProvider } from '../../integrations/realtime';
import { queryClient } from '../../shared/query/queryClient';
import { AdminQuerySync } from './AdminQuerySync';

interface AppProvidersProps {
  children: React.ReactNode;
}

export function AppProviders({ children }: AppProvidersProps): React.ReactElement {
  return (
    <QueryClientProvider client={queryClient}>
      <AdminQuerySync />
      <AdminRealtimeProvider>{children}</AdminRealtimeProvider>
    </QueryClientProvider>
  );
}
