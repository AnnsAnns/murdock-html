import box from '../styles/box.module.css';
import dashboard from './JobListPage.module.css';
import { Icon } from './Icon';

/**
 * A dashboard section: a state-coloured box (ring + offset shadow + title bar)
 * with a title, optional icon/count and a right-aligned action. Used for the
 * "Current Job", "Queued Jobs" and "Past Jobs" panels.
 */
export function JobSection({ title, icon, state, count, action, children }) {
  return (
    <section className={`${box.box} ${dashboard.jobSection}`} data-state={state}>
      <div className={box.boxTitle}>
        {icon && <Icon name={icon} size={14} />}
        <span className={box.titleLabel}>{title}</span>
        {count != null && <span className={dashboard.sectionCount}>{count}</span>}
        {action}
      </div>
      <div className={`${box.boxBody} ${dashboard.sectionBody}`}>{children}</div>
    </section>
  );
}
