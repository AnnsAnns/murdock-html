import { Icon } from './Icon';

function Stat({ value, label, state }) {
  return (
    <span className="stat" data-state={state}>
      <span className="stat-value">{Number(value).toLocaleString()}</span>
      <span className="stat-label">{label}</span>
    </span>
  );
}

/**
 * Compact first-look overview of what the API reported for a job. Detailed
 * per-application data stays in the tabs; this only shows the totals and any
 * failures, and is explicit when a cancelled job has no published results.
 */
export function JobSummary({
  job,
  status,
  stats,
  resultsPublished,
  builds,
  tests,
  buildFailures,
  testFailures,
}) {
  const totalBuilds = stats?.total_builds ?? builds?.length ?? 0;
  const totalTests = stats?.total_tests ?? tests?.length ?? 0;

  const publishedBuildFail = resultsPublished ? (buildFailures?.length ?? 0) : 0;
  const publishedTestFail = resultsPublished ? (testFailures?.length ?? 0) : 0;
  const liveFailures =
    (status?.failed_builds?.length ?? 0) + (status?.failed_tests?.length ?? 0);

  const hasResults = resultsPublished && (totalBuilds > 0 || totalTests > 0);
  const cancelled = ['stopped', 'errored'].includes(job.state) && !resultsPublished;

  if (!hasResults && !cancelled && liveFailures === 0) return null;

  return (
    <div className="job-summary">
      {hasResults && totalBuilds > 0 && <Stat value={totalBuilds} label="builds" />}
      {hasResults && totalTests > 0 && <Stat value={totalTests} label="tests" />}
      {publishedBuildFail > 0 && (
        <Stat value={publishedBuildFail} label="build failures" state="errored" />
      )}
      {publishedTestFail > 0 && (
        <Stat value={publishedTestFail} label="test failures" state="errored" />
      )}
      {!resultsPublished && liveFailures > 0 && (
        <Stat value={liveFailures} label="failures before stop" state="errored" />
      )}
      {cancelled && (
        <span className="job-note muted">
          <Icon name="info" />
          {job.state === 'stopped'
            ? 'Cancelled before detailed results were published.'
            : 'No detailed results published.'}
        </span>
      )}
    </div>
  );
}
