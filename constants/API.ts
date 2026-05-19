/**
 * API Configuration
 *
 * Set EXPO_PUBLIC_API_URL in .env (e.g. http://10.0.0.5:8000 for device testing).
 */

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8000';

export const API_ENDPOINTS = {
  CRISES: `${API_BASE_URL}/api/crises`,
  PIPELINE: `${API_BASE_URL}/api/pipeline`,
  SIGNALS: `${API_BASE_URL}/api/signals`,
  INGEST: `${API_BASE_URL}/api/ingest`,
  INGEST_WITH_IMAGE: `${API_BASE_URL}/api/ingest-with-image`,
  ACTIONS: `${API_BASE_URL}/api/actions`,
  LOGS: `${API_BASE_URL}/api/logs`,
  SEED: `${API_BASE_URL}/api/seed`,
  STATS: `${API_BASE_URL}/api/dashboard/stats`,
  STATS_DETAILED: `${API_BASE_URL}/api/stats`,
  ADK_PIPELINE: `${API_BASE_URL}/api/adk/pipeline`,
  WS_CRISES: `${API_BASE_URL.replace('http', 'ws')}/api/ws/crises`,
};

/** Turn relative /uploads/... paths into absolute URLs for Image components. */
export function resolveUploadUrl(path: string | null | undefined): string | null {
  if (!path) return null;
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  const base = API_BASE_URL.replace(/\/$/, '');
  return `${base}${path.startsWith('/') ? path : `/${path}`}`;
}

export default API_BASE_URL;
