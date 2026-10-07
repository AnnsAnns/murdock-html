import { Link } from 'react-router-dom';
import { FINISHED_STATES } from '../utils/state';
import { Icon } from './Icon';
import { Menu } from './Menu';

/** The maintainer action available for a job in the given state, or null. */
export function jobAction(state) {
  if (state === 'queued') return { action: 'cancel', label: 'Cancel', icon: 'cross' };
  if (state === 'running') return { action: 'abort', label: 'Abort', icon: 'cross' };
  if (FINISHED_STATES.includes(state)) {
    return { action: 'restart', label: 'Restart', icon: 'restart' };
  }
  return null;
}

/**
 * Maintainer action control shared by the dashboard and the job detail header.
 * It owns which action a job state allows and how it is labelled, so the two
 * views cannot drift apart. `onAction` is always called with the action name.
 *
 * - `variant="buttons"` renders a labelled button (detail header). It only
 *   appears for maintainers.
 * - `variant="menu"` renders a "..." menu (job list). The menu is shown to
 *   everyone — it always offers "Open full page" and only adds the maintainer
 *   action when `canManage` is set.
 */
export function JobActions({ job, canManage = false, onAction, busy = false, variant = 'buttons' }) {
  const action = jobAction(job.state);

  if (variant === 'menu') {
    return (
      <Menu label="Job actions" trigger={<Icon name="more" />}>
        <Link className="menu-item" to={`/details/${job.uid}`}>
          <Icon name="external" />
          <span>Open full page</span>
        </Link>
        {canManage && action && (
          <button type="button" className="menu-item" onClick={() => onAction(action.action)}>
            <Icon name={action.icon} />
            <span>{action.label}</span>
          </button>
        )}
      </Menu>
    );
  }

  if (!canManage || !action) return null;

  return (
    <button
      type="button"
      className="btn btn--sm"
      disabled={busy}
      onClick={() => onAction(action.action)}
    >
      <Icon name={action.icon} />
      <span>{action.label}</span>
    </button>
  );
}
