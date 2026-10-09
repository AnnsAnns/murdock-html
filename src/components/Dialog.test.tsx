import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { Dialog } from './Dialog';

function renderDialog(onClose = vi.fn()) {
  return render(
    <Dialog labelledBy="dialog-title" onClose={onClose}>
      <h2 id="dialog-title">Title</h2>
      <button type="button">First</button>
      <button type="button">Last</button>
    </Dialog>,
  );
}

describe('Dialog', () => {
  it('closes on Escape', async () => {
    const onClose = vi.fn();
    renderDialog(onClose);

    await userEvent.keyboard('{Escape}');

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('closes on a backdrop click but not on a panel click', async () => {
    const onClose = vi.fn();
    renderDialog(onClose);

    const dialog = screen.getByRole('dialog');
    await userEvent.click(dialog);
    expect(onClose).not.toHaveBeenCalled();

    await userEvent.click(dialog.parentElement!);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('focuses the first control and restores focus when closed', () => {
    const trigger = document.createElement('button');
    document.body.appendChild(trigger);
    trigger.focus();

    const { unmount } = renderDialog();
    expect(screen.getByRole('button', { name: 'First' })).toHaveFocus();

    unmount();
    expect(trigger).toHaveFocus();
    trigger.remove();
  });

  it('traps Tab focus inside the panel', () => {
    renderDialog();
    const first = screen.getByRole('button', { name: 'First' });
    const last = screen.getByRole('button', { name: 'Last' });

    first.focus();
    fireEvent.keyDown(document, { key: 'Tab', shiftKey: true });
    expect(last).toHaveFocus();

    fireEvent.keyDown(document, { key: 'Tab' });
    expect(first).toHaveFocus();
  });
});
