import { describe, expect, it } from 'vitest';
import { buildAuthorizeUrl } from './github';

describe('buildAuthorizeUrl', () => {
  it('points at GitHub with the client id, scope and state', () => {
    const url = new URL(buildAuthorizeUrl('state-123'));
    expect(`${url.origin}${url.pathname}`).toBe('https://github.com/login/oauth/authorize');
    // .env.test sets VITE_GITHUB_CLIENT_ID=123
    expect(url.searchParams.get('client_id')).toBe('123');
    expect(url.searchParams.get('state')).toBe('state-123');
    expect(url.searchParams.get('scope')).toBe('read:user');
  });
});
