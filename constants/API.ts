/**
 * API configuration
 *
 * Production (Vercel): set EXPO_PUBLIC_API_URL in Project → Settings → Environment Variables
 *   e.g. https://your-service.up.railway.app
 *
 * Local: copy .env.example to .env and point at your backend.
 */

function getApiBaseUrl(): string {
  const url =
    process.env.EXPO_PUBLIC_API_URL ||
    process.env.REACT_APP_API_URL ||
    'http://localhost:8000';
  return url.replace(/\/$/, '');
}

function toWebSocketUrl(httpUrl: string): string {
  if (httpUrl.startsWith('https://')) {
    return `wss://${httpUrl.slice('https://'.length)}`;
  }
  if (httpUrl.startsWith('http://')) {
    return `ws://${httpUrl.slice('http://'.length)}`;
  }
  return httpUrl;
}

export const API_URL = getApiBaseUrl();
export const API_BASE_URL = API_URL;

export const API_ENDPOINTS = {
  CRISES: `${API_URL}/api/crises`,
  PIPELINE: `${API_URL}/api/pipeline`,
  SIGNALS: `${API_URL}/api/signals`,
  INGEST: `${API_URL}/api/ingest`,
  INGEST_WITH_IMAGE: `${API_URL}/api/ingest-with-image`,
  ACTIONS: `${API_URL}/api/actions`,
  LOGS: `${API_URL}/api/logs`,
  SEED: `${API_URL}/api/seed`,
  STATS: `${API_URL}/api/dashboard/stats`,
  STATS_DETAILED: `${API_URL}/api/stats`,
  ADK_PIPELINE: `${API_URL}/api/adk/pipeline`,
  WS_CRISES: `${toWebSocketUrl(API_URL)}/api/ws/crises`,
};

/** Turn relative /uploads/... paths into absolute URLs for Image components. */
export function resolveUploadUrl(path: string | null | undefined): string | null {
  if (!path) return null;
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  return `${API_URL}${path.startsWith('/') ? path : `/${path}`}`;
}

export default API_URL;
