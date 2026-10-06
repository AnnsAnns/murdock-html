import { GITHUB_REPO } from '../api/config';
import { jobTitleUrl, refRepr } from '../utils/job';
import { FINISHED_STATES } from '../utils/state';
import { Icon } from './Icon';
import { StateBadge } from './StateBadge';

export function JobHeader({ job, canManage, onAction, busy = false }) {
  const titleUrl = jobTitleUrl(job, GITHUB_REPO);
  const title = job.prinfo ? `PR #${job.prinfo.number}: ${job.prinfo.title}` : refRepr(job);

  return (
    <div className="box-title">
      <span className="title-label">
        {titleUrl ? (
          <a href={titleUrl} target="_blank" rel="noreferrer noopener">
            {title}
          </a>
        ) : (
          title
        )}
      </span>
      <StateBadge state={job.state} />
      {canManage && (
        <>
          {job.state === 'queued' && (
            <button type="button" className="btn btn--sm" disabled={busy} onClick={() => onAction('cancel')}>
              <Icon name="cross" />
              <span>Cancel</span>
            </button>
          )}
          {job.state === 'running' && (
            <button type="button" className="btn btn--sm" disabled={busy} onClick={() => onAction('abort')}>
              <Icon name="cross" />
              <span>Abort</span>
            </button>
          )}
          {FINISHED_STATES.includes(job.state) && (
            <button type="button" className="btn btn--sm" disabled={busy} onClick={() => onAction('restart')}>
              <Icon name="restart" />
              <span>Restart</span>
            </button>
          )}
        </>
      )}
    </div>
  );
}
