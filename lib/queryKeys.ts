import type { QueryClient } from '@tanstack/react-query';

/** Invalidate every screen that reads from the crisis API. */
export function invalidateCrisisQueries(queryClient: QueryClient) {
  return Promise.all([
    queryClient.invalidateQueries({ queryKey: ['crises'] }),
    queryClient.invalidateQueries({ queryKey: ['crisis'] }),
    queryClient.invalidateQueries({ queryKey: ['dashboard_stats'] }),
    queryClient.invalidateQueries({ queryKey: ['stats_detailed'] }),
    queryClient.invalidateQueries({ queryKey: ['signals'] }),
    queryClient.invalidateQueries({ queryKey: ['actions'] }),
    queryClient.invalidateQueries({ queryKey: ['agent_logs'] }),
  ]);
}
