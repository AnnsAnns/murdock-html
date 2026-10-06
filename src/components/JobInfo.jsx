import { GITHUB_REPO } from '../api/config';
import { formatDayMonthTime, formatEta, preciseDuration, relativeTime } from '../utils/format';
import { jobEnd, jobRefLink, jobStartDate } from '../utils/job';
import { CommitMessage } from './CommitMessage';
import { Icon } from './Icon';

export function JobInfo({ job }) {
  const start = jobStartDate(job);
  const end = jobEnd(job);
  const status = job.status;
  const refLink = jobRefLink(job, GITHUB_REPO);

  let duration = null;
  if (job.state === 'running' && status?.eta != null) duration = formatEta(status.eta);
  else if (job.state !== 'running' && job.runtime !== undefined) duration = preciseDuration(job.runtime);

  return (
    <div>
      <div className="job-info">
        <span className="job-info-item">
          <Icon name="tag" />
          <a
            className="link"
            href={`https://github.com/${GITHUB_REPO}/commit/${job.commit.sha}`}
            target="_blank"
            rel="noreferrer noopener"
            title={job.commit.sha}
          >
            {job.commit.sha.slice(0, 7)}
          </a>
        </span>

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
          <Icon name="person" />
          {job.commit.author}
        </span>
        {start && (
          <span className="job-info-item" title={relativeTime(start)}>
            <Icon name="calendar" />
            {job.state === 'queued' ? 'Queued' : 'Started'} {formatDayMonthTime(start)}
          </span>
        )}
        {end && (
          <span
            className="job-info-item"
            title={end.estimated ? 'Estimated end time' : relativeTime(end.date)}
          >
            <Icon name="calendar" />
            {end.estimated ? 'Ends ~' : 'Ended '}
            {formatDayMonthTime(end.date)}
          </span>
        )}
        {duration && (
          <span className="job-info-item">
            <Icon name="clock" />
            {duration}
          </span>
        )}
      </div>

      <div className="job-commit-message">
        <Icon name="cardText" /> <CommitMessage message={job.commit.message} />
      </div>

      {job.prinfo?.labels?.length > 0 && (
        <div className="labels">
          {job.prinfo.labels.map((label) => (
            <span key={label} className="pill">
              {label}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
