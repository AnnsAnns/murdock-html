import { GITHUB_REPO } from '../api/config';
import dashboard from './JobListPage.module.css';
import jobDetail from './JobInfo.module.css';
import controls from '../styles/controls.module.css';
import { formatDayMonthTime, formatEta, preciseDuration } from '../utils/format';
import { jobEnd, jobRefLink, jobStartDate, jobTitle } from '../utils/job';
import { Icon } from './Icon';
import { JobActions } from './JobActions';
import { JobProgress } from './JobProgress';
import type { Job, JobActionName } from '../types';

export interface CurrentJobProps {
  job: Job;
  canManage: boolean;
  onAction: (action: JobActionName) => void;
  expanded: boolean;
  onToggle: () => void;
}

/**
 * The running job, shown prominently in the "Current Job" section: what it is,
 * where it came from, when it started/ends, the live ETA and the build
 * progress. Clicking the title expands the inline detail; the "..." menu opens
 * the full page or aborts it.
 */
export function CurrentJob({ job, canManage, onAction, expanded, onToggle }: CurrentJobProps) {
  const refLink = jobRefLink(job, GITHUB_REPO);
  const start = jobStartDate(job);
  const end = jobEnd(job);
  const status = job.status;

  // Live ETA while running, else the final runtime (same as the inline detail).
  let duration: string | null = null;
  if (job.state === 'running' && status?.eta != null) duration = formatEta(status.eta);
  else if (job.state !== 'running' && job.runtime !== undefined) duration = preciseDuration(job.runtime);

  return (
    <div className={dashboard.currentJob}>
      <div className={dashboard.currentJobMenuWrap}>
        <JobActions
          job={job}
          canManage={canManage}
          onAction={onAction}
          variant="menu"
          triggerClassName={dashboard.currentJobMenu}
        />
      </div>

      <div className={dashboard.currentJobHead}>
        <button
          type="button"
          className={dashboard.currentJobTitle}
          aria-expanded={expanded}
          onClick={onToggle}
        >
          <Icon
            name="chevronDown"
            size={16}
            className={expanded ? dashboard.isOpen : ''}
          />
          <span>{jobTitle(job)}</span>
        </button>
      </div>

      <div className={jobDetail.jobInfo}>
        {refLink && (
          <a
            className={controls.refLink}
            href={refLink.url}
            target="_blank"
            rel="noreferrer noopener"
            title={refLink.title}
            data-kind={refLink.kind}
          >
            <Icon name={refLink.icon} size={13} />
            <span>{refLink.label}</span>
          </a>
        )}
        <span className={jobDetail.jobInfoItem}>
          <Icon name="tag" />
          <span className="mono">{job.commit.sha.slice(0, 7)}</span>
        </span>
        {start && (
          <span className={jobDetail.jobInfoItem}>
            <Icon name="calendar" />
            Started{' '}
            <span className={jobDetail.jobInfoValue}>{formatDayMonthTime(start)}</span>
          </span>
        )}
        {end && (
          <span
            className={jobDetail.jobInfoItem}
            title={end.estimated ? 'Estimated end time' : undefined}
          >
            <Icon name="clock" />
            {end.estimated ? 'Ends ~' : 'Ended '}
            <span className={jobDetail.jobInfoValue}>{formatDayMonthTime(end.date)}</span>
          </span>
        )}
        {duration && (
          <span className={jobDetail.jobInfoItem}>
            <Icon name="clock" />
            <span className={jobDetail.jobInfoValue}>{duration}</span>
          </span>
        )}
      </div>

      <JobProgress job={job} status={job.status} cornerStats />
    </div>
  );
}
