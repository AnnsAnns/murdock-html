import { Icon } from './Icon';
import { stateIcon, stateLabel } from '../utils/state';

/** Colored job-state badge. `compact` shows only the icon. */
export function StateBadge({ state, compact = false, iconOnly = false }) {
  const label = stateLabel(state);
  return (
    <span className="state-badge" data-state={state} title={label}>
      {state === 'running' ? (
        <span className="spinner" aria-hidden="true" />
      ) : (
        <Icon name={stateIcon(state)} />
      )}
      {!compact && !iconOnly && <span>{label}</span>}
    </span>
  );
}
