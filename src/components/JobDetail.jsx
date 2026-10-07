import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { deleteJob, getJob, getResultFile, restartJob } from '../api/murdock';
import { useAuth } from '../auth/AuthContext';
import box from '../styles/box.module.css';
import controls from '../styles/controls.module.css';
import jobDetail from './JobInfo.module.css';
import misc from '../styles/misc.module.css';
import tabs from './JobDetail.module.css';
import { FailedJobs } from './FailedJobs';
import { Icon } from './Icon';
import { JobArtifacts } from './JobArtifacts';
import { JobBuilds, JobTests } from './JobResults';
import { JobDetails } from './JobDetails';
import { JobHeader } from './JobHeader';
import { JobInfo } from './JobInfo';
import { JobOutput } from './JobOutput';
import { JobProgress } from './JobProgress';
import { JobStats } from './JobStats';
import { JobSummary } from './JobSummary';
import { Spinner } from './Spinner';
import { useToast } from './Toast';
import { useMurdockSocket } from '../hooks/useMurdockSocket';
import { jobContext } from '../utils/job';
import { withViewTransition } from '../utils/viewTransition';

const RESULT_TABS = ['builds', 'tests', 'output', 'artifacts', 'details', 'stats'];

/** A tab is a router link when `href` is given, otherwise a plain button. */
function Tab({ id, active, label, icon, tone, badge = 0, href, onSelect }) {
  const inner = (
    <>
      <span data-state={tone} className={tone ? controls.stateFg : undefined}>
        <Icon name={icon} />
      </span>
      {label}
      {badge > 0 && <span className={misc.tabBadge}>{badge}</span>}
    </>
  );
  const className = `${tabs.tab} ${active ? tabs.isActive : ''}`;

  if (href) {
    return (
      <Link className={className} to={href} aria-current={active ? 'page' : undefined}>
        {inner}
      </Link>
    );
  }

  return (
    <button
      type="button"
      className={className}
      aria-current={active ? 'page' : undefined}
      onClick={() => onSelect?.(id)}
    >
      {inner}
    </button>
  );
}

/**
 * The full job view: header, live progress, failures and the result tabs. Used
 * both by the standalone detail page and by the inline dashboard embed, so the
 * two can never drift apart. It fetches on mount, which is what makes the
 * embed lazy: it is only mounted when a row is expanded.
 *
 * `activeTab`/`tabHref` drive URL-backed tabs on the full page; when omitted
 * (the embed) the tabs are local buttons.
 */
export function JobDetail({ path, activeTab: controlledTab, tabHref, onSelectTab, onJobLoaded }) {
  const navigate = useNavigate();
  const { canManage, user } = useAuth();
  const { notify } = useToast();

  const [job, setJob] = useState(null);
  const [fetched, setFetched] = useState(false);
  const [output, setOutput] = useState(null);
  const [builds, setBuilds] = useState(null);
  const [buildFailures, setBuildFailures] = useState(null);
  const [tests, setTests] = useState(null);
  const [testFailures, setTestFailures] = useState(null);
  const [stats, setStats] = useState(null);
  const [resultsPublished, setResultsPublished] = useState(false);
  const [refreshToken, setRefreshToken] = useState(0);
  const [busy, setBusy] = useState(false);
  const [internalTab, setInternalTab] = useState(null);
  const previousPath = useRef(path);

  // A background `reload` keeps the current job on screen and swaps it in when
  // the refetch resolves; only navigating to a different job resets to loading.
  useEffect(() => {
    const controller = new AbortController();
    const isNewPath = previousPath.current !== path;
    previousPath.current = path;

    if (isNewPath) {
      setFetched(false);
      setBuilds(null);
      setBuildFailures(null);
      setTests(null);
      setTestFailures(null);
      setStats(null);
      setResultsPublished(false);
    }

    getJob(path, controller.signal)
      .then((data) => {
        withViewTransition(() => {
          setJob(data);
          setOutput(data.output ?? null);
          setFetched(true);
        });
      })
      .catch((error) => {
        if (error.name === 'AbortError') return;
        if (isNewPath) {
          setJob(null);
          setOutput(null);
        }
        setFetched(true);
      });

    return () => controller.abort();
  }, [path, refreshToken]);

  // Finished jobs expose their per-application results as static JSON files.
  // Cancelled/stopped jobs usually 404 here, in which case we fall back to the
  // live status counters and any failures captured before the stop.
  useEffect(() => {
    if (!job || !['passed', 'errored', 'stopped'].includes(job.state)) return undefined;
    let cancelled = false;

    const load = (file, setter, markPublished = false) =>
      getResultFile(job.uid, file)
        .then((data) => {
          if (cancelled) return;
          setter(data);
          if (markPublished) setResultsPublished(true);
        })
        .catch(() => {
          if (!cancelled) setter([]);
        });

    load('builds.json', setBuilds, true);
    load('tests.json', setTests, true);
    load('build_failures.json', setBuildFailures);
    load('test_failures.json', setTestFailures);
    load('stats.json', setStats);

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [job?.uid, job?.state, refreshToken]);

  useMurdockSocket((message) => {
    if (message.cmd === 'reload') {
      setRefreshToken((token) => token + 1);
    } else if (message.cmd === 'status' && job && message.uid === job.uid) {
      setJob((current) => (current ? { ...current, status: message.status } : current));
    } else if (message.cmd === 'output' && job && message.uid === job.uid) {
      setOutput((current) => `${current ?? ''}${message.line}`);
    }
  });

  // Let the standalone page mirror the loaded job into the document title.
  useEffect(() => {
    if (job) onJobLoaded?.(job);
  }, [job, onJobLoaded]);

  const onAction = useCallback(
    async (action) => {
      if (!job) return;
      setBusy(true);
      try {
        if (action === 'restart') {
          const restarted = await restartJob(job.uid, user.token);
          notify(`Job ${restarted.uid.slice(0, 7)} ${jobContext(job)} started`);
          navigate(`/details/${restarted.uid}`);
        } else {
          await deleteJob(job.uid, user.token);
          notify(
            `${action === 'cancel' ? 'Cancelling' : 'Stopping'} job ${job.uid.slice(0, 7)} ${jobContext(job)}`,
          );
        }
      } catch {
        notify(`Failed to ${action} job ${job.uid.slice(0, 7)} ${jobContext(job)}`, 'danger');
      } finally {
        setBusy(false);
      }
    },
    [job, user, notify, navigate],
  );

  if (!fetched) return <Spinner />;
  if (!job) return <div className="empty-state">Job not found.</div>;

  const status = job.status;
  // tests.json embeds a `failures` array per application; prefer the dedicated
  // file but fall back to the embedded list so nothing is hidden.
  const effectiveTestFailures =
    (testFailures?.length ?? 0) > 0
      ? testFailures
      : (tests ?? []).flatMap((test) => test.failures ?? []);
  const buildFailCount = resultsPublished
    ? (buildFailures?.length ?? 0)
    : (status?.failed_builds?.length ?? 0);
  const testFailCount = resultsPublished
    ? effectiveTestFailures.length
    : (status?.failed_tests?.length ?? 0);
  const hasFailedBuilds = buildFailCount > 0;
  const hasFailedTests = testFailCount > 0;
  const buildsAvailable = (builds?.length ?? 0) > 0 || (status?.failed_builds?.length ?? 0) > 0;
  const testsAvailable = (tests?.length ?? 0) > 0 || (status?.failed_tests?.length ?? 0) > 0;
  const detailsAvailable = 'fasttracked' in job && 'trigger' in job && Boolean(job.env);
  const artifactsAvailable = (job.artifacts?.length ?? 0) > 0;
  const statsAvailable = (stats?.total_jobs ?? 0) > 0;
  const outputAvailable = job.state !== 'queued';

  const requestedTab = controlledTab ?? internalTab;
  const activeTab = (() => {
    if (requestedTab && RESULT_TABS.includes(requestedTab)) return requestedTab;
    if (buildsAvailable && ['passed', 'errored'].includes(job.state)) return 'builds';
    if ((status?.failed_builds?.length ?? 0) > 0 && ['stopped', 'running'].includes(job.state)) {
      return 'builds';
    }
    if (job.state === 'queued') return 'details';
    return 'output';
  })();

  const selectTab = (id) => {
    if (onSelectTab) onSelectTab(id);
    else setInternalTab(id);
  };
  const href = (id) => (tabHref ? tabHref(id) : undefined);

  return (
    <>
      <article className={`${box.box} ${jobDetail.jobHeader}`} data-state={job.state}>
        <JobHeader job={job} canManage={canManage} onAction={onAction} busy={busy} />
        <div className={box.boxBody}>
          <JobInfo job={job} />
          <JobProgress job={job} status={status} />
          <JobSummary
            job={job}
            status={status}
            stats={stats}
            resultsPublished={resultsPublished}
            builds={builds}
            tests={tests}
            buildFailures={buildFailures}
            testFailures={effectiveTestFailures}
          />
        </div>
      </article>

      <FailedJobs jobs={status?.failed_jobs} />

      <div>
        <nav className={tabs.tabs} aria-label="Job sections">
          {buildsAvailable && (
            <Tab
              id="builds"
              active={activeTab === 'builds'}
              label="Builds"
              icon={hasFailedBuilds ? 'cross' : 'check'}
              tone={hasFailedBuilds ? 'errored' : 'passed'}
              badge={buildFailCount}
              href={href('builds')}
              onSelect={selectTab}
            />
          )}
          {testsAvailable && (
            <Tab
              id="tests"
              active={activeTab === 'tests'}
              label="Tests"
              icon={hasFailedTests ? 'cross' : 'check'}
              tone={hasFailedTests ? 'errored' : 'passed'}
              badge={testFailCount}
              href={href('tests')}
              onSelect={selectTab}
            />
          )}
          {outputAvailable && (
            <Tab
              id="output"
              active={activeTab === 'output'}
              label="Output"
              icon="fileText"
              href={href('output')}
              onSelect={selectTab}
            />
          )}
          {artifactsAvailable && (
            <Tab
              id="artifacts"
              active={activeTab === 'artifacts'}
              label="Artifacts"
              icon="files"
              href={href('artifacts')}
              onSelect={selectTab}
            />
          )}
          {detailsAvailable && (
            <Tab
              id="details"
              active={activeTab === 'details'}
              label="Details"
              icon="info"
              href={href('details')}
              onSelect={selectTab}
            />
          )}
          {statsAvailable && (
            <Tab
              id="stats"
              active={activeTab === 'stats'}
              label="Stats"
              icon="chart"
              href={href('stats')}
              onSelect={selectTab}
            />
          )}
        </nav>

        <div className={tabs.tabPanel}>
          {activeTab === 'output' && outputAvailable && <JobOutput job={job} output={output} />}
          {activeTab === 'builds' && buildsAvailable && (
            <JobBuilds
              uid={job.uid}
              builds={builds}
              buildFailures={buildFailures}
              job={job}
              status={status}
              stats={stats}
            />
          )}
          {activeTab === 'tests' && testsAvailable && (
            <JobTests
              uid={job.uid}
              tests={tests}
              testFailures={testFailures}
              job={job}
              status={status}
              stats={stats}
            />
          )}
          {activeTab === 'details' && detailsAvailable && <JobDetails job={job} />}
          {activeTab === 'artifacts' && artifactsAvailable && <JobArtifacts job={job} />}
          {activeTab === 'stats' && statsAvailable && <JobStats stats={stats} />}
        </div>
      </div>
    </>
  );
}
