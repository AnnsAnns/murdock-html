import { Link } from 'react-router-dom';
import { GITHUB_REPO } from '../api/config';
import { buildProgress, jobTitle, jobTitleUrl, jobTooltip, prStateColor } from '../utils/job';
import { formatDateTime, humanizeSeconds, preciseDuration, relativeTime } from '../utils/format';
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
              {job.status?.eta != null ? humanizeSeconds(job.status.eta) : 'running'} (
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
  if (!canManage) return <StateBadge state={job.state} />;

  return (
    <Menu label="Job actions" trigger={<StateBadge state={job.state} />}>
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

export function JobRow({ job, canManage, onAction }) {
  const created = new Date(job.creation_time * 1000);
  const titleUrl = jobTitleUrl(job, GITHUB_REPO);
  const githubState = prStateColor(job.prinfo);
  const title = job.prinfo ? `PR #${job.prinfo.number}: ${jobTitle(job)}` : jobTitle(job);

  return (
    <li className="job-row" data-state={job.state}>
      <div className="job-uid">
        <Link to={`/details/${job.uid}`} title={job.uid}>
          {job.uid.slice(0, 7)}
        </Link>
      </div>

      <div className="job-title">
        <a
          className="github-mark"
          href={titleUrl}
          target="_blank"
          rel="noreferrer noopener"
          title={titleUrl}
          data-state={githubState ?? undefined}
        >
          <Icon name="github" className={githubState ? 'state-fg' : ''} />
        </a>
        <Link className="job-title-text" to={`/details/${job.uid}`} title={jobTooltip(job)}>
          {title}
        </Link>
      </div>

      <div className="job-date">
        <Link to={`/details/${job.uid}`} title={relativeTime(created)}>
          {formatDateTime(created)}
        </Link>
      </div>

      <DurationCell job={job} />

      <div className="job-state">
        <StateCell job={job} canManage={canManage} onAction={onAction} />
      </div>
    </li>
  );
}
