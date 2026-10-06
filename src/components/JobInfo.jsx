import { GITHUB_REPO } from '../api/config';
import { formatDateTime, humanizeSeconds, preciseDuration, relativeTime } from '../utils/format';
import { CommitMessage } from './CommitMessage';
import { Icon } from './Icon';

export function JobInfo({ job }) {
  const created = new Date(job.creation_time * 1000);
  const status = job.status;

  let runtime = null;
  if (job.state === 'running' && status?.eta != null) runtime = humanizeSeconds(status.eta);
  else if (job.state !== 'running' && job.runtime !== undefined) runtime = preciseDuration(job.runtime);

  return (
    <div>
      <div className="job-info">
        <span className="job-info-item">
          <Icon name="tag" />
          <a
            href={`https://github.com/${GITHUB_REPO}/commit/${job.commit.sha}`}
            target="_blank"
            rel="noreferrer noopener"
            title={job.commit.sha}
          >
            {job.commit.sha.slice(0, 7)}
          </a>
        </span>
        <span className="job-info-item">
          <Icon name="person" />
          {job.commit.author}
        </span>
        <span className="job-info-item" title={relativeTime(created)}>
          <Icon name="calendar" />
          {formatDateTime(created)}
        </span>
        {runtime && (
          <span className="job-info-item">
            <Icon name="clock" />
            {runtime}
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
