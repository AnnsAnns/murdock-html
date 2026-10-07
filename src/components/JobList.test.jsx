import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { JobList } from './JobList';

const job = {
  uid: 'abc1234',
  commit: { sha: 'deadbeef', message: 'core: fix the thing', author: 'ann' },
  ref: 'refs/heads/master',
  creation_time: 1700000000,
  start_time: 1700000001,
  runtime: 42,
  state: 'passed',
  status: {},
};

function renderList(props) {
  return render(
    <MemoryRouter>
      <JobList jobs={[job]} queuedStarts={new Map()} {...props} />
    </MemoryRouter>,
  );
}

describe('JobList', () => {
  it('binds a row action to its own job', async () => {
    const onAction = vi.fn();
    renderList({ canManage: true, onAction });

    await userEvent.click(screen.getByRole('button', { name: 'Restart job' }));
    await userEvent.click(screen.getByRole('button', { name: 'Restart' }));

    expect(onAction).toHaveBeenCalledWith(job, 'restart');
  });

  it('shows no action menu without manage rights', () => {
    renderList({ canManage: false, onAction: () => {} });
    expect(screen.queryByRole('button', { name: 'Restart job' })).not.toBeInTheDocument();
  });
});
