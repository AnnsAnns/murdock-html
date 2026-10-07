import { useEffect, useRef, useState, type ReactNode } from 'react';
import styles from './Menu.module.css';

interface MenuProps {
  trigger: ReactNode;
  children: ReactNode;
  label?: string;
  triggerClassName?: string;
}

/** Small click-outside dropdown used for maintainer job actions. */
export function Menu({ trigger, children, label = 'Actions', triggerClassName = '' }: MenuProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return undefined;
    const onPointerDown = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  return (
    <div className={styles.menu} ref={ref}>
      <button
        type="button"
        className={`${styles.menuTrigger}${triggerClassName ? ` ${triggerClassName}` : ''}`}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={label}
        onClick={() => setOpen((value) => !value)}
      >
        {trigger}
      </button>
      {open && (
        <div className={styles.menuItems} onClick={() => setOpen(false)}>
          {children}
        </div>
      )}
    </div>
  );
}
