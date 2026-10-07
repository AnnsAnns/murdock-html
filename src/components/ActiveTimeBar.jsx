import { Link } from 'react-router-dom';
import { preciseDuration } from '../utils/format';
import { activeTimeTimeline } from '../utils/job';
import { stateLabel } from '../utils/state';

/**
 * A chronological bar of CI occupancy. Finished jobs show their runtime and a
 * running job its elapsed time (the "active time"); the running ETA and the
 * queued jobs' estimated runtimes are the striped "expected" future. Idle gaps
 * (nothing running) are filled with a neutral hatch, and every job segment
 * links to that job's detail page.
 */
export function ActiveTimeBar({ jobs, now, refreshing = false }) {
  const segments = activeTimeTimeline(jobs, now);
  if (!segments.length) return null;

  const sum = (predicate) =>
    segments.filter(predicate).reduce((total, seg) => total + seg.seconds, 0);

  const active = sum((seg) => !seg.idle && !seg.future);
  const idle = sum((seg) => seg.idle);
  const future = sum((seg) => seg.future);

  const utilization = active + idle > 0 ? Math.round((active / (active + idle)) * 100) : null;

  const label = (seg) => `${stateLabel(seg.state)} · ${preciseDuration(seg.seconds)}`;

  return (
    <div className="active-time">
      <div className="active-time-head">
        <span className="active-time-title">Active time</span>
        <span className="active-time-total">{preciseDuration(active)}</span>
        {idle > 0 && <span className="active-time-idle">{preciseDuration(idle)} idle</span>}
        {utilization != null && (
          <span className="active-time-util">{utilization}% utilized</span>
        )}
        {future > 0 && (
          <span className="active-time-future">+{preciseDuration(future)} expected</span>
        )}
        {refreshing && <span className="spinner" role="status" aria-label="Updating" />}
      </div>
      <div className="active-time-bar">
        {segments.map((seg) => {
          const style = { flexGrow: seg.seconds };
          const key = `${seg.uid ?? 'idle'}-${seg.start}`;

          if (seg.idle) {
            return (
              <span
                key={key}
                className="active-time-seg is-idle"
                style={style}
                title={`Idle · ${preciseDuration(seg.seconds)}`}
              />
            );
          }

          return (
            <Link
              key={key}
              className={`active-time-seg${seg.future ? ' is-future' : ''}`}
              data-state={seg.state}
              style={style}
              to={`/details/${seg.uid}`}
              title={label(seg)}
              aria-label={label(seg)}
            />
          );
        })}
      </div>
    </div>
  );
}
