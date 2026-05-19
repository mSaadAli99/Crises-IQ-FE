import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { API_ENDPOINTS } from '@/constants/API';
import { invalidateCrisisQueries } from '@/lib/queryKeys';

export interface Crisis {
  id: number;
  crisis_type: string;
  location: string;
  latitude: number;
  longitude: number;
  confidence_score: number;
  severity: string;
  status: string;
  created_at: string;
  social_verification_sources?: SocialVerificationPost[];
  social_sources_count?: number;
}

export interface SocialVerificationPost {
  username?: string;
  text?: string;
  timestamp?: string;
  platform?: string;
}

export interface SituationReport {
  id: number;
  crisis_id: number;
  severity_level: string;
  affected_area: string;
  impact_estimate: string;
  reasoning: string;
  created_at: string;
}

export interface CrisisDetail extends Crisis {
  situation_report?: SituationReport | null;
  actions?: ActionData[];
  agent_logs?: AgentLogData[];
}

export function useCrises(limit?: number, offset?: number) {
  return useQuery<Crisis[]>({
    queryKey: ['crises', limit, offset],
    queryFn: async () => {
      const url = new URL(API_ENDPOINTS.CRISES);
      if (limit !== undefined) url.searchParams.append('limit', limit.toString());
      if (offset !== undefined) url.searchParams.append('offset', offset.toString());

      const response = await fetch(url.toString());
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    },
  });
}

export interface DashboardStats {
  active_crises: number;
  agents_running: number;
  system_status: string;
}

export interface DetailedStats {
  active_crises: number;
  total_signals: number;
  alerts_sent: number;
  resolved_today: number;
}

export function useStats() {
  return useQuery<DashboardStats>({
    queryKey: ['dashboard_stats'],
    queryFn: async () => {
      const response = await fetch(API_ENDPOINTS.STATS);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    },
  });
}

export function useDetailedStats() {
  return useQuery<DetailedStats>({
    queryKey: ['stats_detailed'],
    queryFn: async () => {
      const response = await fetch(API_ENDPOINTS.STATS_DETAILED);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    },
  });
}

export function useCrisis(id: string | number) {
  return useQuery<CrisisDetail>({
    queryKey: ['crisis', id],
    queryFn: async () => {
      const response = await fetch(`${API_ENDPOINTS.CRISES}/${id}`);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    },
    enabled: !!id,
  });
}

export interface SignalData {
  id: number;
  text: string;
  normalized_text: string;
  language: string;
  source_type: string;
  location: string;
  latitude?: number;
  longitude?: number;
  image_url?: string | null;
  verification_score?: number | null;
  is_ai_generated?: boolean;
  created_at: string;
}

export function useSignals() {
  return useQuery<SignalData[]>({
    queryKey: ['signals'],
    queryFn: async () => {
      const response = await fetch(API_ENDPOINTS.SIGNALS);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    },
  });
}

export interface ActionData {
  id: number;
  crisis_id: number;
  action_type: string;
  description: string;
  status: string;
  simulation_result?: {
    success?: boolean;
    message?: string;
    [key: string]: unknown;
  };
  before_metrics?: Record<string, unknown>;
  after_metrics?: Record<string, unknown>;
  created_at: string;
}

export function useActions() {
  return useQuery<ActionData[]>({
    queryKey: ['actions'],
    queryFn: async () => {
      const response = await fetch(API_ENDPOINTS.ACTIONS);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    },
  });
}

export interface AgentLogData {
  id: number;
  crisis_id: number | null;
  agent_number: number;
  agent_name: string;
  input_data?: unknown;
  output_data?: unknown;
  reasoning: string;
  duration_ms: number;
  created_at: string;
}

export function useAgentLogs() {
  return useQuery<AgentLogData[]>({
    queryKey: ['agent_logs'],
    queryFn: async () => {
      const response = await fetch(API_ENDPOINTS.LOGS);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    },
  });
}

export function useSeedDemo() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const response = await fetch(API_ENDPOINTS.SEED, { method: 'POST' });
      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error((err as { detail?: string }).detail || 'Seed failed');
      }
      return response.json();
    },
    onSuccess: () => invalidateCrisisQueries(queryClient),
  });
}
