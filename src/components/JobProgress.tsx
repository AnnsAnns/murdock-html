import type { Job, JobStatus } from '../types';
import jobDetail from './JobInfo.module.css';
import progressStyles from './JobProgress.module.css';
import { buildProgress } from '../utils/job';
import { Icon } from './Icon';

/**
 * Live build progress / status line for running, stopped or cancelled jobs.
 *
 * With `cornerStats` the fail/pass/done column is pinned to the right edge of
 * the panel and spans its full height (see CurrentJob), so it uses existing
 * space instead of adding a row and stretching the panel.
 */
interface JobProgressProps {
  job: Job;
  status?: JobStatus;
  cornerStats?: boolean;
}

export function JobProgress({ job, status, cornerStats = false }: JobProgressProps) {
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
        <div className={progressStyles.progressTrack}>
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
      <span
        className={`${jobDetail.jobInfoItem} ${progressStyles.progressStats}${
          cornerStats ? ` ${progressStyles.progressStatsCorner}` : ''
        }`}
      >
        <span className={progressStyles.progressStat} title={`${progress.failed} failed`}>
          {progress.failed}
          <Icon name="cross" size={14} className={progressStyles.statFail} />
        </span>
        <span className={progressStyles.progressStat} title={`${progress.passed} passed`}>
          {progress.passed}
          <Icon name="check" size={14} className={progressStyles.statPass} />
        </span>
        <span className={progressStyles.progressStat} title={`${progress.done} of ${progress.total} done`}>
          {progress.done}/{progress.total}
          <Icon name="dash" size={14} className={progressStyles.statDone} />
        </span>
      </span>
    </div>
  );
}
