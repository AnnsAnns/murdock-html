import { Link } from 'react-router-dom';
import { GITHUB_REPO } from '../api/config';
import {
  buildProgress,
  jobEnd,
  jobRefLink,
  jobStartDate,
  jobTitle,
  jobTooltip,
} from '../utils/job';
import { formatDayMonthTime, formatEta, preciseDuration, relativeTime } from '../utils/format';
import { FINISHED_STATES } from '../utils/state';
import { Icon } from './Icon';
import { Menu } from './Menu';
import { StateBadge } from './StateBadge';

function DurationCell({ job }) {
  const progress = buildProgress(job.status);

  if (job.state === 'running') {
    if (progress) {
      return (
        <Link
          className="job-duration"
          to={`/details/${job.uid}`}
          title={`fail: ${progress.failed} pass: ${progress.passed} done: ${progress.done}/${progress.total}`}
        >
          <span className="row" style={{ gap: 4 }}>
            {progress.failed > 0 && <Icon name="warning" className="state-fg flicker" />}
            <span>
              {job.status?.eta != null ? formatEta(job.status.eta) : 'running'} (
              {progress.percent}%)
            </span>
          </span>
          <div className="progress">
            <div
              className="progress-bar is-striped"
              data-state={progress.failed ? 'errored' : 'running'}
              style={{ width: `${progress.percent}%` }}
            />
          </div>
        </Link>
      );
    }
    return (
      <Link className="job-duration" to={`/details/${job.uid}`}>
        <span className="spinner" aria-hidden="true" />
        {job.status?.status ? <em>{job.status.status}…</em> : null}
      </Link>
    );
  }

  if (FINISHED_STATES.includes(job.state)) {
    return (
      <Link className="job-duration" to={`/details/${job.uid}`}>
        {preciseDuration(job.runtime ?? 0)}
      </Link>
    );
  }

  return <span className="job-duration muted">-</span>;
}

function StateCell({ job, canManage, onAction }) {
  const failed =
    (job.status?.failed_jobs?.length ?? 0) +
    (job.status?.failed_builds?.length ?? 0) +
    (job.status?.failed_tests?.length ?? 0);

  const badge = <StateBadge state={job.state} count={failed} />;

  if (!canManage) return badge;

  return (
    <Menu label="Job actions" trigger={badge}>
      {job.state === 'queued' && (
        <button type="button" className="menu-item" onClick={() => onAction('cancel')}>
          <Icon name="cross" />
          <span>Cancel</span>
        </button>
      )}
      {job.state === 'running' && (
        <button type="button" className="menu-item" onClick={() => onAction('abort')}>
          <Icon name="cross" />
          <span>Abort</span>
        </button>
      )}
      {FINISHED_STATES.includes(job.state) && (
        <button type="button" className="menu-item" onClick={() => onAction('restart')}>
          <Icon name="restart" />
          <span>Restart</span>
        </button>
      )}
    </Menu>
  );
}

export function JobRow({ job, canManage, onAction, queuedStarts }) {
  const start = jobStartDate(job);
  const end = jobEnd(job);

  // A queued job cannot start before the jobs ahead of it finish. The page
  // estimates that moment from the queue (running job ETA + queued jobs'
  // runtimes guessed from their CI flags) and passes it in as a Map.
  const queuedStart =
    job.state === 'queued' && queuedStarts?.has(job.uid)
      ? new Date(queuedStarts.get(job.uid))
      : null;

  const refLink = jobRefLink(job, GITHUB_REPO);
  const title = jobTitle(job);

  return (
    <li className="job-row" data-state={job.state}>
      <div className="job-uid">
        <Link to={`/details/${job.uid}`} title={job.uid}>
          {job.uid.slice(0, 7)}
        </Link>
      </div>

      <div className="job-title">
        {refLink && (
          <a
            className="ref-link"
            href={refLink.url}
            target="_blank"
            rel="noreferrer noopener"
            title={refLink.title}
          >
            <Icon name={refLink.icon} size={13} />
            <span>{refLink.label}</span>
          </a>
        )}
        <Link className="job-title-text" to={`/details/${job.uid}`} title={jobTooltip(job)}>
          {title}
        </Link>
      </div>

      <div className="job-start">
        {queuedStart ? (
          <Link
            to={`/details/${job.uid}`}
            title="Estimated start, after the jobs ahead in the queue"
          >
            ≥ {formatDayMonthTime(queuedStart)}
          </Link>
        ) : start ? (
          <Link to={`/details/${job.uid}`} title={relativeTime(start)}>
            {formatDayMonthTime(start)}
          </Link>
        ) : (
          <span className="muted">-</span>
        )}
      </div>

      <div className="job-end">
        {end ? (
          <Link
            to={`/details/${job.uid}`}
            title={end.estimated ? 'Estimated end time' : relativeTime(end.date)}
          >
            {end.estimated ? `~${formatDayMonthTime(end.date)}` : formatDayMonthTime(end.date)}
          </Link>
        ) : (
          <span className="muted">-</span>
        )}
      </div>

      <DurationCell job={job} />

      <div className="job-state">
        <StateCell job={job} canManage={canManage} onAction={onAction} />
      </div>
    </li>
  );
}
