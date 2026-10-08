import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import type { ComponentProps } from 'react';
import { JobList } from './JobList';
import type { Job } from '../types';

const job: Job = {
  uid: 'abc1234',
  commit: { sha: 'deadbeef', message: 'core: fix the thing', author: 'ann' },
  ref: 'refs/heads/master',
  creation_time: 1700000000,
  start_time: 1700000001,
  runtime: 42,
  state: 'passed',
  status: {},
};

function renderList(
  props: Pick<ComponentProps<typeof JobList>, 'canManage' | 'onAction'> & { jobs?: Job[] },
) {
  const { jobs = [job], ...rest } = props;
  return render(
    <MemoryRouter>
      <JobList jobs={jobs} queuedStarts={new Map()} {...rest} />
    </MemoryRouter>,
  );
}

describe('JobList', () => {
  it('binds a row action to its own job', async () => {
    const onAction = vi.fn();
    renderList({ canManage: true, onAction });

    await userEvent.click(screen.getByRole('button', { name: 'Job actions' }));
    await userEvent.click(screen.getByRole('button', { name: 'Restart' }));

    expect(onAction).toHaveBeenCalledWith(job, 'restart');
  });

  it('shows the menu but no maintainer action without manage rights', async () => {
    renderList({ canManage: false, onAction: () => {} });

    await userEvent.click(screen.getByRole('button', { name: 'Job actions' }));
    expect(screen.getByRole('link', { name: /Open full page/ })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Restart' })).not.toBeInTheDocument();
  });

  it('marks a PR ref link with its GitHub state', () => {
    const merged: Job = {
      ...job,
      prinfo: {
        number: 7,
        url: 'https://github.com/x/y/pull/7',
        state: 'closed',
        is_merged: true,
      },
    };
    renderList({ jobs: [merged], canManage: false, onAction: () => {} });

    const link = screen.getByRole('link', { name: /PR #7/ });
    expect(link).toHaveAttribute('data-kind', 'pr');
    expect(link).toHaveAttribute('data-pr-state', 'merged');
  });
});
