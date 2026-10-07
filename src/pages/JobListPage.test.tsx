import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AuthProvider } from '../auth/AuthContext';
import { ToastProvider } from '../components/Toast';
import { JobListPage } from './JobListPage';
import type { Job, JobState } from '../types';

const job: Job = {
  uid: '29c3d405db074a24a34e4ce9c07ee8c7',
  commit: { sha: '87f30ba9', message: 'core: fix the thing', author: 'ann' },
  ref: 'refs/heads/master',
  creation_time: 1700000000,
  runtime: 42,
  state: 'passed',
  status: {},
};

const fetchMock = vi.fn();

function jsonResponse(data: unknown) {
  return Promise.resolve({
    ok: true,
    status: 200,
    headers: new Headers({ 'content-type': 'application/json' }),
    json: async () => data,
  });
}

beforeEach(() => {
  fetchMock.mockReset();
  fetchMock.mockImplementation((url: RequestInfo | URL) => {
    if (String(url).includes('/jobs')) return jsonResponse([job]);
    return Promise.resolve({
      ok: false,
      status: 404,
      headers: new Headers(),
      json: async () => ({}),
    });
  });
  vi.stubGlobal('fetch', fetchMock);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

function renderPage() {
  return render(
    <MemoryRouter>
      <AuthProvider>
        <ToastProvider>
          <JobListPage />
        </ToastProvider>
      </AuthProvider>
    </MemoryRouter>,
  );
}

describe('JobListPage', () => {
  it('renders the fetched jobs', async () => {
    renderPage();
    expect(await screen.findByText(/core: fix the thing/)).toBeInTheDocument();
    expect(screen.getByText('Success')).toBeInTheDocument();
    // 42s appears in both the row duration and the active-time bar.
    expect(screen.getAllByText('42s').length).toBeGreaterThan(0);
  });

  it('groups jobs into Current, Queued and Past sections', async () => {
    const makeJob = (
      uid: string,
      state: JobState,
      message: string,
      extra: Partial<Job> = {},
    ): Job => ({
      ...job,
      uid,
      state,
      commit: { ...job.commit, message },
      ...extra,
    });

    const running = makeJob('run', 'running', 'running: the current one', {
      start_time: 1700000010,
      status: { eta: 30, total: 4, passed: 2, failed: 0 },
    });
    const queued = makeJob('queue', 'queued', 'queued: next in line', {
      start_time: 0,
      status: {},
    });
    const passed = makeJob('past', 'passed', 'past: already done');

    fetchMock.mockImplementation((url: RequestInfo | URL) =>
      String(url).includes('/jobs') ? jsonResponse([running, queued, passed]) : Promise.reject(),
    );

    renderPage();

    expect(await screen.findByText('Current Job')).toBeInTheDocument();
    expect(screen.getByText('Queued Jobs')).toBeInTheDocument();
    expect(screen.getByText('Past Jobs')).toBeInTheDocument();
    expect(screen.getByText(/running: the current one/)).toBeInTheDocument();
    expect(screen.getByText(/queued: next in line/)).toBeInTheDocument();
    expect(screen.getByText(/past: already done/)).toBeInTheDocument();
  });

  it('shows the empty state when there are no jobs', async () => {
    fetchMock.mockImplementation((url: RequestInfo | URL) =>
      String(url).includes('/jobs') ? jsonResponse([]) : Promise.reject(new Error('unexpected')),
    );
    renderPage();
    expect(await screen.findByText('No job matching')).toBeInTheDocument();
  });

  it('fetches the detail only once a row is expanded', async () => {
    const past: Job = { ...job, uid: 'past123', state: 'passed' };
    const calls: string[] = [];
    fetchMock.mockImplementation((url: RequestInfo | URL) => {
      const href = String(url);
      calls.push(href);
      if (href.includes('/jobs')) return jsonResponse([past]);
      if (href.includes('/job/past123')) return jsonResponse(past);
      if (href.includes('/results/')) return jsonResponse([]);
      return jsonResponse({});
    });

    renderPage();
    expect(await screen.findByText(/core: fix the thing/)).toBeInTheDocument();
    expect(calls.some((href) => href.includes('/job/past123'))).toBe(false);

    await userEvent.click(screen.getByRole('button', { name: 'Expand job past123' }));

    expect(await screen.findByRole('button', { name: 'Collapse job past123' })).toBeInTheDocument();
    expect(calls.some((href) => href.includes('/job/past123'))).toBe(true);
  });
});
