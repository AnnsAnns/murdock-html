import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { AUTH_ENABLED, GITHUB_REPO } from '../api/config';
import { buildAuthorizeUrl, exchangeCode, fetchCanPush, fetchGithubProfile } from './github';

const AuthContext = createContext(null);

const STORAGE_KEY = 'murdock-user';
const STATE_KEY = 'murdock-oauth-state';

function readStored() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function writeStored(user) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
  } catch {
    /* storage unavailable */
  }
}

function clearStored() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* storage unavailable */
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(readStored);
  const [permissions, setPermissions] = useState('unknown');
  const [ready, setReady] = useState(false);

  // Validate a token against GitHub and derive the maintainer permission.
  const applyUser = useCallback(async (candidate) => {
    if (!candidate?.token) {
      setUser(null);
      setPermissions('no');
      return;
    }
    setUser(candidate);
    try {
      const [profile, canPush] = await Promise.all([
        fetchGithubProfile(candidate.token),
        fetchCanPush(candidate.token, GITHUB_REPO),
      ]);
      const next = { ...candidate, ...profile };
      setUser(next);
      writeStored(next);
      setPermissions(canPush ? 'push' : 'no');
    } catch {
      clearStored();
      setUser(null);
      setPermissions('no');
    }
  }, []);

  // One-time session bootstrap: finish an OAuth callback or restore a session.
  useEffect(() => {
    if (initStarted) return;
    initStarted = true;

    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    const state = params.get('state');

    if (code) {
      const expected = sessionStorage.getItem(STATE_KEY);
      sessionStorage.removeItem(STATE_KEY);

      // Strip the OAuth params from the address bar before doing anything else.
      const clean = new URL(window.location.href);
      clean.searchParams.delete('code');
      clean.searchParams.delete('state');
      window.history.replaceState({}, '', `${clean.pathname}${clean.search}${clean.hash}`);

      if (expected && state !== expected) {
        console.warn('GitHub OAuth state mismatch; ignoring callback');
        setPermissions('no');
        setReady(true);
        return;
      }

      exchangeCode(code)
        .then((token) => applyUser({ token, login: '', avatarUrl: '' }))
        .catch((error) => {
          console.error('GitHub login failed', error);
          setPermissions('no');
        })
        .finally(() => setReady(true));
      return;
    }

    const stored = readStored();
    if (stored?.token) {
      applyUser(stored).finally(() => setReady(true));
    } else {
      setPermissions('no');
      setReady(true);
    }
  }, [applyUser]);

  const login = useCallback(() => {
    const state =
      typeof crypto !== 'undefined' && crypto.randomUUID
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random()}`;
    sessionStorage.setItem(STATE_KEY, state);
    window.location.assign(buildAuthorizeUrl(state));
  }, []);

  const logout = useCallback(() => {
    clearStored();
    setUser(null);
    setPermissions('no');
  }, []);

  const value = useMemo(
    () => ({
      user,
      permissions,
      ready,
      login,
      logout,
      enabled: AUTH_ENABLED,
      canManage: permissions === 'push',
    }),
    [user, permissions, ready, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Module-level guard: the bootstrap must run exactly once even under
// React StrictMode's double effect invocation.
let initStarted = false;

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
