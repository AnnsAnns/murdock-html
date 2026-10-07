import jobDetail from './JobInfo.module.css';
import progressStyles from './JobProgress.module.css';
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
        <span className={jobDetail.jobInfoItem}>
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
          <div className={`${progressStyles.progress} ${progressStyles.isTall}`}>
            <div
              className={`${progressStyles.progressBar} ${
                job.state === 'running' ? progressStyles.isStriped : ''
              }`}
              data-state={progress.failed ? 'errored' : 'running'}
              style={{ width: `${progress.percent}%` }}
            >
              {progress.percent}%
            </div>
          </div>
        </div>
      )}
      <span className={jobDetail.jobInfoItem}>
        <Icon name="chart" />
        {`fail: ${progress.failed} pass: ${progress.passed} done: ${progress.done}/${progress.total}`}
      </span>
    </div>
  );
}
