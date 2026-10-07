import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { JobActions, jobAction } from './JobActions';

const job = { uid: 'abc1234', state: 'passed' };

function renderMenu(props) {
  return render(
    <MemoryRouter>
      <JobActions job={job} variant="menu" {...props} />
    </MemoryRouter>,
  );
}

describe('jobAction', () => {
  it('maps each state to its maintainer action', () => {
    expect(jobAction('queued').action).toBe('cancel');
    expect(jobAction('running').action).toBe('abort');
    expect(jobAction('passed').action).toBe('restart');
    expect(jobAction('errored').action).toBe('restart');
    expect(jobAction('stopped').action).toBe('restart');
    expect(jobAction('mystery')).toBeNull();
  });
});

describe('JobActions', () => {
  it('renders a labelled button that reports the action', async () => {
    const onAction = vi.fn();
    render(<JobActions job={job} canManage onAction={onAction} />);

    await userEvent.click(screen.getByRole('button', { name: 'Restart' }));
    expect(onAction).toHaveBeenCalledWith('restart');
  });

  it('disables the button while busy', () => {
    render(<JobActions job={{ state: 'running' }} canManage onAction={() => {}} busy />);
    expect(screen.getByRole('button', { name: 'Abort' })).toBeDisabled();
  });

  it('renders no button without manage rights', () => {
    const { container } = render(<JobActions job={job} onAction={() => {}} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('offers "Open full page" to everyone', async () => {
    renderMenu({ canManage: false, onAction: () => {} });

    await userEvent.click(screen.getByRole('button', { name: 'Job actions' }));
    expect(screen.getByRole('link', { name: /Open full page/ })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Restart' })).not.toBeInTheDocument();
  });

  it('adds the maintainer action when allowed', async () => {
    const onAction = vi.fn();
    renderMenu({ canManage: true, onAction });

    await userEvent.click(screen.getByRole('button', { name: 'Job actions' }));
    await userEvent.click(screen.getByRole('button', { name: 'Restart' }));

    expect(onAction).toHaveBeenCalledWith('restart');
  });

  it('renders nothing for a state without an action', () => {
    const { container } = render(
      <JobActions job={{ state: 'weird' }} canManage onAction={() => {}} />,
    );
    expect(container).toBeEmptyDOMElement();
  });
});
