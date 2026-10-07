import { Link } from 'react-router-dom';
import { GITHUB_REPO } from '../api/config';
import dashboard from './JobListPage.module.css';
import jobDetail from './JobInfo.module.css';
import controls from '../styles/controls.module.css';
import { formatDayMonthTime } from '../utils/format';
import { jobEnd, jobRefLink, jobStartDate, jobTitle } from '../utils/job';
import { Icon } from './Icon';
import { JobProgress } from './JobProgress';
import type { Job } from '../types';

export interface CurrentJobProps {
  job: Job;
}

/**
 * The running job, shown prominently in the "Current Job" section: what it is,
 * where it came from, when it started/ends and the live build progress.
 */
export function CurrentJob({ job }: CurrentJobProps) {
  const refLink = jobRefLink(job, GITHUB_REPO);
  const start = jobStartDate(job);
  const end = jobEnd(job);

  return (
    <div className={dashboard.currentJob}>
      <Link className={dashboard.currentJobTitle} to={`/details/${job.uid}`}>
        {jobTitle(job)}
      </Link>

      <div className={jobDetail.jobInfo}>
        {refLink && (
          <a
            className={controls.refLink}
            href={refLink.url}
            target="_blank"
            rel="noreferrer noopener"
            title={refLink.title}
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
      </div>

      <JobProgress job={job} status={job.status} cornerStats />
    </div>
  );
}
