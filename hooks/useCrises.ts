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

export function useCrises() {
  return useQuery<Crisis[]>({
    queryKey: ['crises'],
    queryFn: async () => {
      const response = await fetch(API_ENDPOINTS.CRISES);
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
