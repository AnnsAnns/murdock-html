// Runtime configuration from Vite env vars (see .env.example).

const env = import.meta.env;

const trimSlash = (value) => (value ? value.replace(/\/+$/, '') : value);

export const API_BASE = trimSlash(env.VITE_MURDOCK_HTTP_BASE_URL) || 'https://ci.riot-os.org';

export const WS_URL = env.VITE_MURDOCK_WS_URL || 'wss://ci.riot-os.org/ws/status';

export const GITHUB_REPO = env.VITE_GITHUB_REPO || 'RIOT-OS/RIOT';
export const GITHUB_REPO_URL = `https://github.com/${GITHUB_REPO}`;

export const GITHUB_CLIENT_ID = env.VITE_GITHUB_CLIENT_ID || '';
export const GITHUB_GATEKEEPER_URL = trimSlash(env.VITE_GITHUB_GATEKEEPER_URL) || `${API_BASE}/github`;
export const GITHUB_REDIRECT_URI =
  env.VITE_GITHUB_REDIRECT_URI ||
  (typeof window !== 'undefined' ? `${window.location.origin}/` : '');

export const PRIVACY_URL = env.VITE_PRIVACY_URL || 'https://www.riot-os.org/privacy-policy.html';

export const ITEMS_DISPLAYED_STEP = Number.parseInt(env.VITE_ITEMS_DISPLAYED_STEP || '25', 10);

export const AUTH_ENABLED = Boolean(GITHUB_CLIENT_ID);
