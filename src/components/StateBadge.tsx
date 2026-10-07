import { Icon } from './Icon';
import controls from '../styles/controls.module.css';
import { stateIcon, stateLabel } from '../utils/state';

/**
 * Colored job-state badge. An optional `count` folds the number of failures
 * into the same label (e.g. "Failed · 21") instead of a separate pill.
 * `compact`/`iconOnly` show just the icon.
 */
interface StateBadgeProps {
  state: string;
  count?: number;
  compact?: boolean;
  iconOnly?: boolean;
}

export function StateBadge({ state, count = 0, compact = false, iconOnly = false }: StateBadgeProps) {
  const label = stateLabel(state);
  const text = count > 0 ? `${label} · ${count}` : label;

  return (
    <span
      className={controls.stateBadge}
      data-state={state}
      title={count > 0 ? `${label} — ${count} failures reported` : label}
    >
      {state === 'running' ? (
        <span className="spinner" aria-hidden="true" />
      ) : (
        <Icon name={stateIcon(state)} />
      )}
      {!compact && !iconOnly && <span>{text}</span>}
    </span>
  );
}
