import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AuthProvider } from '../auth/AuthContext';
import { ToastProvider } from '../components/Toast';
import { JobPage } from './JobPage';

const job = {
  uid: 'abc123',
  commit: { sha: '87f30ba9', message: 'core: fix the thing', author: 'ann' },
  ref: 'refs/heads/master',
  creation_time: 1700000000,
  start_time: 1700000001,
  runtime: 42,
  fasttracked: false,
  trigger: 'push',
  env: { BOARD: 'native' },
  state: 'passed',
  status: { passed: 2, failed: 0, total: 2 },
  artifacts: ['results/report.html'],
};

function jsonResponse(data) {
  return Promise.resolve({
    ok: true,
    status: 200,
    headers: new Headers({ 'content-type': 'application/json' }),
    json: async () => data,
  });
}

beforeEach(() => {
  vi.stubGlobal(
    'fetch',
    vi.fn((url) => {
      const href = String(url);
      if (href.includes('/job/abc123')) return jsonResponse(job);
      if (href.includes('/results/abc123/builds.json')) {
        return jsonResponse([
          { application: 'tests/foo', build_success: 1, build_failures: 0 },
        ]);
      }
      if (href.includes('/results/abc123/stats.json')) {
        return jsonResponse({ total_jobs: 1, total_builds: 1, total_tests: 0, total_time: 42, workers: [] });
      }
      if (href.includes('/results/abc123/')) return jsonResponse([]);
      return Promise.resolve({ ok: false, status: 404, headers: new Headers(), json: async () => ({}) });
    }),
  );
});

afterEach(() => {
  vi.unstubAllGlobals();
});

function renderJob() {
  return render(
    <MemoryRouter initialEntries={['/details/abc123']}>
      <AuthProvider>
        <ToastProvider>
          <Routes>
            <Route path="/details/:uid" element={<JobPage />} />
            <Route path="/details/:uid/:tab" element={<JobPage />} />
          </Routes>
        </ToastProvider>
      </AuthProvider>
    </MemoryRouter>,
  );
}

describe('JobPage', () => {
  it('renders the job header, info and result tabs', async () => {
    renderJob();

    expect(await screen.findByText(/master @ core: fix the thing/)).toBeInTheDocument();
    expect(await screen.findByRole('link', { name: /Builds/ })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Output/ })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Details/ })).toBeInTheDocument();

    // Defaults to the builds tab for a passed job and lists applications.
    expect(await screen.findByText(/Applications \(1\)/)).toBeInTheDocument();
    expect(screen.getByText('tests/foo')).toBeInTheDocument();
  });

  it('shows the details tab content on the details route', async () => {
    render(
      <MemoryRouter initialEntries={['/details/abc123/details']}>
        <AuthProvider>
          <ToastProvider>
            <Routes>
              <Route path="/details/:uid/:tab" element={<JobPage />} />
            </Routes>
          </ToastProvider>
        </AuthProvider>
      </MemoryRouter>,
    );

    expect(await screen.findByText('Trigger type')).toBeInTheDocument();
    expect(screen.getByText('BOARD')).toBeInTheDocument();
  });
});
