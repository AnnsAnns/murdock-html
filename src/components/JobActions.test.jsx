import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { JobActions, jobAction } from './JobActions';

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
    render(<JobActions job={{ state: 'passed' }} onAction={onAction} />);

    await userEvent.click(screen.getByRole('button', { name: 'Restart' }));
    expect(onAction).toHaveBeenCalledWith('restart');
  });

  it('disables the button while busy', () => {
    render(<JobActions job={{ state: 'running' }} onAction={() => {}} busy />);
    expect(screen.getByRole('button', { name: 'Abort' })).toBeDisabled();
  });

  it('hides the menu behind a "..." trigger', async () => {
    const onAction = vi.fn();
    render(<JobActions job={{ state: 'errored' }} onAction={onAction} variant="menu" />);

    expect(screen.queryByText('Restart')).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Restart job' }));
    await userEvent.click(screen.getByRole('button', { name: 'Restart' }));

    expect(onAction).toHaveBeenCalledWith('restart');
  });

  it('renders nothing for a state without an action', () => {
    const { container } = render(<JobActions job={{ state: 'weird' }} onAction={() => {}} />);
    expect(container).toBeEmptyDOMElement();
  });
});
