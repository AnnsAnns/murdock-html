// GitHub OAuth + REST helpers. The OAuth code is exchanged by a gatekeeper
// (https://github.com/prose/gatekeeper): GET {gatekeeper}/authenticate/{code}.

import { GITHUB_CLIENT_ID, GITHUB_GATEKEEPER_URL, GITHUB_REDIRECT_URI, GITHUB_SCOPE } from '../api/config';
import type { GithubProfile } from '../types';

export function buildAuthorizeUrl(state: string): string {
  const url = new URL('https://github.com/login/oauth/authorize');
  url.searchParams.set('client_id', GITHUB_CLIENT_ID);
  url.searchParams.set('redirect_uri', GITHUB_REDIRECT_URI);
  url.searchParams.set('scope', GITHUB_SCOPE);
  url.searchParams.set('state', state);
  return url.toString();
}

function githubHeaders(token: string): Record<string, string> {
  return {
    Authorization: `Bearer ${token}`,
    Accept: 'application/vnd.github+json',
  };
}

export async function exchangeCode(code: string): Promise<string> {
  const response = await fetch(`${GITHUB_GATEKEEPER_URL}/authenticate/${encodeURIComponent(code)}`);
  const data = (await response.json().catch(() => ({}))) as {
    token?: string;
    error?: string;
  };
  if (!response.ok || !data.token) {
    throw new Error(data.error || 'The GitHub gatekeeper did not return a token');
  }
  return data.token;
}

export async function fetchGithubProfile(token: string): Promise<GithubProfile> {
  const response = await fetch('https://api.github.com/user', { headers: githubHeaders(token) });
  if (!response.ok) throw new Error(`GitHub profile request failed (${response.status})`);
  const data = (await response.json()) as {
    login: string;
    avatar_url: string;
    name?: string | null;
  };
  return { login: data.login, avatarUrl: data.avatar_url, name: data.name };
}

export async function fetchCanPush(token: string, repo: string): Promise<boolean> {
  const response = await fetch(`https://api.github.com/repos/${repo}`, {
    headers: githubHeaders(token),
  });
  if (!response.ok) return false;
  const data = (await response.json()) as { permissions?: { push?: boolean } };
  return Boolean(data.permissions?.push);
}
