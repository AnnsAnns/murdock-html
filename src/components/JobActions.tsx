import { Link } from 'react-router-dom';
import controls from '../styles/controls.module.css';
import menu from './Menu.module.css';
import { FINISHED_STATES } from '../utils/state';
import { Icon } from './Icon';
import { Menu } from './Menu';
import type { IconName, JobActionName } from '../types';

/** The maintainer action available for a job in the given state, or null. */
export function jobAction(
  state: string,
): { action: JobActionName; label: string; icon: IconName } | null {
  if (state === 'queued') return { action: 'cancel', label: 'Cancel', icon: 'cross' };
  if (state === 'running') return { action: 'abort', label: 'Abort', icon: 'cross' };
  if ((FINISHED_STATES as readonly string[]).includes(state)) {
    return { action: 'restart', label: 'Restart', icon: 'restart' };
  }
  return null;
}

export interface JobActionsProps {
  job: { uid?: string; state: string };
  canManage?: boolean;
  onAction: (action: JobActionName) => void;
  busy?: boolean;
  variant?: 'buttons' | 'menu';
  triggerClassName?: string;
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
export function JobActions({
  job,
  canManage = false,
  onAction,
  busy = false,
  variant = 'buttons',
  triggerClassName,
}: JobActionsProps) {
  const action = jobAction(job.state);

  if (variant === 'menu') {
    return (
      <Menu label="Job actions" trigger={<Icon name="more" />} triggerClassName={triggerClassName}>
        <Link className={menu.menuItem} to={`/details/${job.uid}`}>
          <Icon name="external" />
          <span>Open full page</span>
        </Link>
        {canManage && action && (
          <button
            type="button"
            className={menu.menuItem}
            onClick={() => onAction(action.action)}
          >
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
      className={`${controls.btn} ${controls.btnSm} ${controls.btnOnAccent}`}
      disabled={busy}
      onClick={() => onAction(action.action)}
    >
      <Icon name={action.icon} />
      <span>{action.label}</span>
    </button>
  );
}
