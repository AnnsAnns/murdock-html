import { GITHUB_REPO } from '../api/config';
import { jobTitleUrl, refRepr } from '../utils/job';
import { Icon } from './Icon';
import { JobActions } from './JobActions';
import { StateBadge } from './StateBadge';

export function JobHeader({ job, canManage, onAction, busy = false }) {
  const titleUrl = jobTitleUrl(job, GITHUB_REPO);
  const title = job.prinfo ? `PR #${job.prinfo.number}: ${job.prinfo.title}` : refRepr(job);

  return (
    <div className="box-title">
      <span className="title-label">
        {titleUrl ? (
          <a href={titleUrl} target="_blank" rel="noreferrer noopener" title={titleUrl}>
            {title} <Icon name="external" size={13} />
          </a>
        ) : (
          title
        )}
      </span>
      <StateBadge state={job.state} />
      {canManage && <JobActions job={job} onAction={onAction} busy={busy} />}
    </div>
  );
}
