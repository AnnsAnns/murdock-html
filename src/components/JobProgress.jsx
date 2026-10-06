import { buildProgress } from '../utils/job';
import { Icon } from './Icon';

/** Live build progress / status line for running, stopped or cancelled jobs. */
export function JobProgress({ job, status }) {
  if (!status) return null;
  if (job.state === 'errored' && (!status.status || status.status !== 'canceled')) return null;
  if (!['errored', 'running', 'stopped'].includes(job.state)) return null;

  const progress = buildProgress(status);

  if (!progress) {
    if (!status.status) return null;
    return (
      <div className="row" style={{ marginTop: 8 }}>
        <span className="job-info-item">
          <Icon name="transfer" />
          {status.status}
        </span>
      </div>
    );
  }

  return (
    <div className="row" style={{ marginTop: 10, gap: 16, alignItems: 'center' }}>
      {['running', 'stopped'].includes(job.state) && (
        <div style={{ flex: '1 1 320px', minWidth: 200 }}>
          <div className="progress is-tall">
            <div
              className="progress-bar is-striped"
              data-state={progress.failed ? 'errored' : 'running'}
              style={{ width: `${progress.percent}%` }}
            >
              {progress.percent}%
            </div>
          </div>
        </div>
      )}
      <span className="job-info-item">
        <Icon name="chart" />
        {`fail: ${progress.failed} pass: ${progress.passed} done: ${progress.done}/${progress.total}`}
      </span>
    </div>
  );
}
