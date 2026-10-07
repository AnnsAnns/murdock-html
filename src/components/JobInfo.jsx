import { GITHUB_REPO } from '../api/config';
import controls from '../styles/controls.module.css';
import jobDetail from './JobInfo.module.css';
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
      <div className={jobDetail.jobInfo}>
        <span className={jobDetail.jobInfoItem}>
          <Icon name="tag" />
          <a
            className={controls.link}
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
          <Icon name="person" />
          {job.commit.author}
        </span>
        {start && (
          <span className={jobDetail.jobInfoItem} title={relativeTime(start)}>
            <Icon name="calendar" />
            {job.state === 'queued' ? 'Queued' : 'Started'} {formatDayMonthTime(start)}
          </span>
        )}
        {end && (
          <span
            className={jobDetail.jobInfoItem}
            title={end.estimated ? 'Estimated end time' : relativeTime(end.date)}
          >
            <Icon name="calendar" />
            {end.estimated ? 'Ends ~' : 'Ended '}
            {formatDayMonthTime(end.date)}
          </span>
        )}
        {duration && (
          <span className={jobDetail.jobInfoItem}>
            <Icon name="clock" />
            {duration}
          </span>
        )}
      </div>

      <div className={jobDetail.jobCommitMessage}>
        <Icon name="cardText" /> <CommitMessage message={job.commit.message} />
      </div>

      {job.prinfo?.labels?.length > 0 && (
        <div className={jobDetail.labels}>
          {job.prinfo.labels.map((label) => (
            <span key={label} className={controls.pill}>
              {label}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
