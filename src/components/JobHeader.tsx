import { GITHUB_REPO } from '../api/config';
import box from '../styles/box.module.css';
import { jobTitleUrl, refRepr } from '../utils/job';
import { Icon } from './Icon';
import { JobActions } from './JobActions';
import { StateBadge } from './StateBadge';
import type { Job, JobActionName } from '../types';

export interface JobHeaderProps {
  job: Job;
  canManage: boolean;
  onAction: (action: JobActionName) => void;
  busy?: boolean;
}

export function JobHeader({ job, canManage, onAction, busy = false }: JobHeaderProps) {
  const titleUrl = jobTitleUrl(job, GITHUB_REPO);
  const title = job.prinfo ? `PR #${job.prinfo.number}: ${job.prinfo.title}` : refRepr(job);

  return (
    <div className={box.boxTitle}>
      <span className={box.titleLabel}>
        {titleUrl ? (
          <a href={titleUrl} target="_blank" rel="noreferrer noopener" title={titleUrl}>
            {title} <Icon name="external" size={13} />
          </a>
        ) : (
          title
        )}
      </span>
      <StateBadge state={job.state} />
      <JobActions job={job} canManage={canManage} onAction={onAction} busy={busy} />
    </div>
  );
}
