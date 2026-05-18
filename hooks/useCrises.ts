import { useQuery } from '@tanstack/react-query';
import { API_ENDPOINTS } from '@/constants/API';

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

export function useCrisis(id: string | number) {
  return useQuery({
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
    [key: string]: any;
  };
  before_metrics?: Record<string, any>;
  after_metrics?: Record<string, any>;
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
  crisis_id: number;
  agent_number: number;
  agent_name: string;
  input_data?: any;
  output_data?: any;
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
