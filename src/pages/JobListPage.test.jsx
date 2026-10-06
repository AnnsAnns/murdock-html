import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AuthProvider } from '../auth/AuthContext';
import { ToastProvider } from '../components/Toast';
import { JobListPage } from './JobListPage';

const job = {
  uid: '29c3d405db074a24a34e4ce9c07ee8c7',
  commit: { sha: '87f30ba9', message: 'core: fix the thing', author: 'ann' },
  ref: 'refs/heads/master',
  creation_time: 1700000000,
  runtime: 42,
  state: 'passed',
  status: {},
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
      if (String(url).includes('/jobs')) return jsonResponse([job]);
      return Promise.resolve({
        ok: false,
        status: 404,
        headers: new Headers(),
        json: async () => ({}),
      });
    }),
  );
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
    expect(screen.getByText('42s')).toBeInTheDocument();
  });

  it('shows the empty state when there are no jobs', async () => {
    fetch.mockImplementation((url) =>
      String(url).includes('/jobs') ? jsonResponse([]) : Promise.reject(new Error('unexpected')),
    );
    renderPage();
    expect(await screen.findByText('No job matching')).toBeInTheDocument();
  });
});
