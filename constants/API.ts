/**
 * API Configuration
 * 
 * In development, we use localhost.
 * In production, this would be your deployed backend URL (e.g., on Railway, Render, etc.)
 */

// Read from environment variable configured in .env (prefixed with EXPO_PUBLIC_ for Expo clients)
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8000';

export const API_ENDPOINTS = {
  CRISES: `${API_BASE_URL}/api/crises`,
  PIPELINE: `${API_BASE_URL}/api/pipeline`,
  SIGNALS: `${API_BASE_URL}/api/signals`,
  INGEST: `${API_BASE_URL}/api/ingest`,
  ACTIONS: `${API_BASE_URL}/api/actions`,
  LOGS: `${API_BASE_URL}/api/logs`,
  SEED: `${API_BASE_URL}/api/seed`,
  STATS: `${API_BASE_URL}/api/dashboard/stats`,
  WS_CRISES: `${API_BASE_URL.replace('http', 'ws')}/api/ws/crises`,
};

export default API_BASE_URL;
