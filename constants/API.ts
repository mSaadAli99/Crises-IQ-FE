/**
 * API Configuration
 * 
 * In development, we use localhost.
 * In production, this would be your deployed backend URL (e.g., on Railway, Render, etc.)
 */

// Use your machine's IP address instead of localhost if testing on a physical device
const API_BASE_URL = 'http://localhost:8000';

export const API_ENDPOINTS = {
  CRISES: `${API_BASE_URL}/api/crises`,
  PIPELINE: `${API_BASE_URL}/api/pipeline`,
  SIGNALS: `${API_BASE_URL}/api/signals`,
  SEED: `${API_BASE_URL}/api/seed`,
};

export default API_BASE_URL;
