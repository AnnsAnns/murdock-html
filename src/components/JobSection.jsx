import { Icon } from './Icon';

/**
 * A dashboard section: a state-coloured box (ring + offset shadow + title bar)
 * with a title, optional icon/count and a right-aligned action. Used for the
 * "Current Job", "Queued Jobs" and "Past Jobs" panels.
 */
export function JobSection({ title, icon, state, count, action, children }) {
  return (
    <section className="box job-section" data-state={state}>
      <div className="box-title">
        {icon && <Icon name={icon} size={14} />}
        <span className="title-label">{title}</span>
        {count != null && <span className="section-count">{count}</span>}
        {action}
      </div>
      <div className="box-body">{children}</div>
    </section>
  );
}
