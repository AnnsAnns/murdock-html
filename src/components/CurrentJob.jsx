import { Link } from 'react-router-dom';
import { GITHUB_REPO } from '../api/config';
import { formatDayMonthTime } from '../utils/format';
import { jobEnd, jobRefLink, jobStartDate, jobTitle } from '../utils/job';
import { Icon } from './Icon';
import { JobProgress } from './JobProgress';

/**
 * The running job, shown prominently in the "Current Job" section: what it is,
 * where it came from, when it started/ends and the live build progress.
 */
export function CurrentJob({ job }) {
  const refLink = jobRefLink(job, GITHUB_REPO);
  const start = jobStartDate(job);
  const end = jobEnd(job);

  return (
    <div className="current-job">
      <Link className="current-job-title" to={`/details/${job.uid}`}>
        {jobTitle(job)}
      </Link>

      <div className="job-info">
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
        <span className="job-info-item">
          <Icon name="tag" />
          <span className="mono">{job.commit.sha.slice(0, 7)}</span>
        </span>
        {start && (
          <span className="job-info-item">
            <Icon name="calendar" />
            Started {formatDayMonthTime(start)}
          </span>
        )}
        {end && (
          <span className="job-info-item" title={end.estimated ? 'Estimated end time' : undefined}>
            <Icon name="clock" />
            {end.estimated ? `Ends ~${formatDayMonthTime(end.date)}` : `Ended ${formatDayMonthTime(end.date)}`}
          </span>
        )}
      </div>

      <JobProgress job={job} status={job.status} />
    </div>
  );
}
