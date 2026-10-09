import { useEffect, useRef, type ReactNode } from 'react';
import styles from './Dialog.module.css';

/** Elements that can receive focus, used for the initial focus and Tab trap. */
const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), ' +
  'textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

export interface DialogProps {
  /** `id` of the element labelling the dialog (for `aria-labelledby`). */
  labelledBy?: string;
  role?: 'dialog' | 'alertdialog';
  onClose: () => void;
  /** Extra class for the panel, e.g. to set its width. */
  className?: string;
  children: ReactNode;
}

/**
 * Shared modal shell: a fixed backdrop, Escape to dismiss, a backdrop click to
 * close, focus handling (initial focus, a Tab trap and restore-on-close) and a
 * body scroll lock. Callers render the panel content and own title/actions.
 *
 * The `onClose` callback is read through a ref, so an inline arrow does not
 * re-run the setup effect (and re-focus) on every render.
 */
export function Dialog({ labelledBy, role = 'dialog', onClose, className, children }: DialogProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    onCloseRef.current = onClose;
  });

  useEffect(() => {
    const previouslyFocused = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const panel = panelRef.current;
    const initial = panel?.querySelector<HTMLElement>(FOCUSABLE);
    (initial ?? panel)?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onCloseRef.current();
        return;
      }
      if (event.key !== 'Tab' || !panel) return;

      const focusable = Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE));
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', onKeyDown);
      previouslyFocused?.focus();
    };
  }, []);

  return (
    <div
      className={styles.backdrop}
      onClick={(event) => {
        if (event.target === event.currentTarget) onCloseRef.current();
      }}
    >
      <div
        ref={panelRef}
        className={`${styles.dialog}${className ? ` ${className}` : ''}`}
        role={role}
        aria-modal="true"
        aria-labelledby={labelledBy}
        tabIndex={-1}
      >
        {children}
      </div>
    </div>
  );
}
