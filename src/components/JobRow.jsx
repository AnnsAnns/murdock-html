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
import { JobActions } from './JobActions';
import { StateBadge } from './StateBadge';

function DurationCell({ job }) {
  const progress = buildProgress(job.status);

  if (job.state === 'running') {
    if (progress) {
      return (
        <div
          className="job-duration"
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
        </div>
      );
    }
    return (
      <div className="job-duration">
        <span className="spinner" aria-hidden="true" />
        {job.status?.status ? <em>{job.status.status}…</em> : null}
      </div>
    );
  }

  if (FINISHED_STATES.includes(job.state)) {
    return <div className="job-duration">{preciseDuration(job.runtime ?? 0)}</div>;
  }

  return <div className="job-duration muted">-</div>;
}

function StateCell({ job, canManage, onAction }) {
  const failed =
    (job.status?.failed_jobs?.length ?? 0) +
    (job.status?.failed_builds?.length ?? 0) +
    (job.status?.failed_tests?.length ?? 0);

  return (
    <>
      <StateBadge state={job.state} count={failed} />
      <JobActions job={job} canManage={canManage} onAction={onAction} variant="menu" />
    </>
  );
}

export function JobRow({ job, canManage, onAction, queuedStarts, expanded = false, onToggle }) {
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
    <li
      className={`job-row ${expanded ? 'is-expanded' : ''}`}
      data-state={job.state}
      onClick={() => onToggle?.()}
    >
      <div className="job-ref">
        {refLink ? (
          <a
            className="ref-link"
            href={refLink.url}
            target="_blank"
            rel="noreferrer noopener"
            title={refLink.title}
            onClick={(event) => event.stopPropagation()}
          >
            <Icon name={refLink.icon} size={13} />
            <span className="ref-link-label">{refLink.label}</span>
          </a>
        ) : (
          <span className="muted">-</span>
        )}
      </div>

      <div className="job-title">
        <button
          type="button"
          className="job-expand"
          aria-expanded={expanded}
          aria-label={`${expanded ? 'Collapse' : 'Expand'} job ${job.uid.slice(0, 7)}`}
          onClick={(event) => {
            event.stopPropagation();
            onToggle?.();
          }}
        >
          <Icon name="chevronDown" size={14} className={expanded ? 'is-open' : ''} />
        </button>

        <span className="job-title-text" title={jobTooltip(job)}>
          {title}
        </span>
      </div>

      <div className="job-start">
        {queuedStart ? (
          <span title="Estimated start, after the jobs ahead in the queue">
            ≥ {formatDayMonthTime(queuedStart)}
          </span>
        ) : start ? (
          <span title={relativeTime(start)}>{formatDayMonthTime(start)}</span>
        ) : (
          <span className="muted">-</span>
        )}
      </div>

      <div className="job-end">
        {end ? (
          <span title={end.estimated ? 'Estimated end time' : relativeTime(end.date)}>
            {end.estimated ? `~${formatDayMonthTime(end.date)}` : formatDayMonthTime(end.date)}
          </span>
        ) : (
          <span className="muted">-</span>
        )}
      </div>

      <DurationCell job={job} />

      <div className="job-state" onClick={(event) => event.stopPropagation()}>
        <StateCell job={job} canManage={canManage} onAction={onAction} />
      </div>
    </li>
  );
}
