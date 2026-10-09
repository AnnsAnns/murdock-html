import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Result } from './Result';
import { ToastProvider } from './Toast';
import type { JobRefSource, ResultItem } from '../types';

const result: ResultItem = {
  application: 'tests/net/foo',
  target: 'samr21-xpro',
  toolchain: 'gnu',
  worker: 'mobi1',
  runtime: 1.23,
  status: false,
};

const prJob: JobRefSource = { prinfo: { number: 12321 } };

function renderResult(job?: JobRefSource | null) {
  return render(
    <ToastProvider>
      <Result uid="abc123" type="tests" result={result} job={job} />
    </ToastProvider>,
  );
}

async function openDialog(job?: JobRefSource | null) {
  renderResult(job);
  await userEvent.click(screen.getByRole('button', { name: 'Copy build instructions' }));
}

describe('Result reproduce dialog', () => {
  beforeEach(() => {
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText: vi.fn().mockResolvedValue(undefined) },
      configurable: true,
    });
  });

  it('opens on the git recipe and can switch to gh', async () => {
    await openDialog(prJob);

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText(/git fetch upstream pull\/12321\/head/)).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'gh CLI' }));

    expect(screen.getByText(/gh pr checkout 12321/)).toBeInTheDocument();
    expect(screen.queryByText(/git fetch upstream pull\/12321\/head/)).not.toBeInTheDocument();
  });

  it('copies the default git recipe', async () => {
    await openDialog(prJob);
    await userEvent.click(screen.getByRole('button', { name: 'Copy git checkout' }));

    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
      expect.stringContaining('git fetch upstream pull/12321/head'),
    );
    expect(await screen.findByText('Copied to clipboard')).toBeInTheDocument();
  });

  it('offers only a build recipe without a PR', async () => {
    await openDialog({ ref: 'refs/heads/master' });

    expect(screen.queryByRole('button', { name: 'gh CLI' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'git checkout' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Build only' })).toBeInTheDocument();
  });

  it('closes on Escape', async () => {
    await openDialog(prJob);
    await userEvent.keyboard('{Escape}');

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});
