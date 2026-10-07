import { afterEach, describe, expect, it, vi } from 'vitest';
import { supportsViewTransitions, withViewTransition } from './viewTransition';

afterEach(() => {
  delete (document as { startViewTransition?: unknown }).startViewTransition;
});

describe('withViewTransition', () => {
  it('runs the update inside startViewTransition when available', () => {
    const update = vi.fn();
    const startViewTransition = vi.fn((callback: () => void) => {
      callback();
    });
    document.startViewTransition =
      startViewTransition as unknown as typeof document.startViewTransition;

    withViewTransition(update);

    expect(startViewTransition).toHaveBeenCalledOnce();
    expect(update).toHaveBeenCalledOnce();
  });

  it('falls back to a plain update when unsupported', () => {
    expect(supportsViewTransitions()).toBe(false);
    const update = vi.fn();

    withViewTransition(update);

    expect(update).toHaveBeenCalledOnce();
  });
});
