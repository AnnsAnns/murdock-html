import { flushSync } from 'react-dom';

/** Whether the browser supports the View Transitions API. */
export function supportsViewTransitions() {
  return typeof document !== 'undefined' && typeof document.startViewTransition === 'function';
}

/**
 * Run a React state update inside a view transition so the resulting DOM change
 * animates (cross-fades) instead of snapping. Falls back to a plain update when
 * the API is unavailable. `flushSync` is required so React commits the change
 * within the transition callback.
 */
export function withViewTransition(update) {
  if (!supportsViewTransitions()) {
    update();
    return;
  }

  document.startViewTransition(() => {
    flushSync(update);
  });
}
