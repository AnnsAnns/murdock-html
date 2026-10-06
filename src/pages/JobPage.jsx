import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { deleteJob, getJob, getResultFile, restartJob } from '../api/murdock';
import { useAuth } from '../auth/AuthContext';
import { Icon } from '../components/Icon';
import { JobArtifacts } from '../components/JobArtifacts';
import { JobDetails } from '../components/JobDetails';
import { JobHeader } from '../components/JobHeader';
import { JobInfo } from '../components/JobInfo';
import { JobOutput } from '../components/JobOutput';
import { JobProgress } from '../components/JobProgress';
import { JobBuilds, JobTests } from '../components/JobResults';
import { JobStats } from '../components/JobStats';
import { Spinner } from '../components/Spinner';
import { useToast } from '../components/Toast';
import { useDocumentTitle, useFavicon } from '../hooks/useDocumentTitle';
import { useMurdockSocket } from '../hooks/useMurdockSocket';
import { jobContext, refRepr } from '../utils/job';

const RESULT_TABS = ['builds', 'tests', 'output', 'artifacts', 'details', 'stats'];

function Tab({ path, id, active, label, icon, tone }) {
  return (
    <Link
      className={`tab ${active ? 'is-active' : ''}`}
      to={`/details/${path}/${id}`}
      aria-current={active ? 'page' : undefined}
    >
      <span data-state={tone} className={tone ? 'state-fg' : undefined}>
        <Icon name={icon} />
      </span>
      {label}
    </Link>
  );
}

export function JobPage() {
  const routeParams = useParams();
  const navigate = useNavigate();
  const { canManage, user } = useAuth();
  const { notify } = useToast();

  // The API path is a uid or `branch/{x}`, `tag/{x}`, `commit/{sha}`, `pr/{n}`.
  const path = useMemo(() => {
    if (routeParams.branch) return `branch/${routeParams.branch}`;
    if (routeParams.tag) return `tag/${routeParams.tag}`;
    if (routeParams.commit) return `commit/${routeParams.commit}`;
    if (routeParams.prnum) return `pr/${routeParams.prnum}`;
    return routeParams.uid;
  }, [routeParams]);

  const [job, setJob] = useState(null);
  const [fetched, setFetched] = useState(false);
  const [output, setOutput] = useState(null);
  const [builds, setBuilds] = useState(null);
  const [buildFailures, setBuildFailures] = useState(null);
  const [tests, setTests] = useState(null);
  const [testFailures, setTestFailures] = useState(null);
  const [stats, setStats] = useState(null);
  const [refreshToken, setRefreshToken] = useState(0);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    setFetched(false);
    setBuilds(null);
    setBuildFailures(null);
    setTests(null);
    setTestFailures(null);
    setStats(null);

    getJob(path, controller.signal)
      .then((data) => {
        setJob(data);
        setOutput(data.output ?? null);
        setFetched(true);
      })
      .catch((error) => {
        if (error.name === 'AbortError') return;
        setJob(null);
        setOutput(null);
        setFetched(true);
      });

    return () => controller.abort();
  }, [path, refreshToken]);

  // Finished jobs expose their per-application results as static JSON files.
  useEffect(() => {
    if (!job || !['passed', 'errored'].includes(job.state)) return undefined;
    let cancelled = false;

    const load = (file, setter) =>
      getResultFile(job.uid, file)
        .then((data) => {
          if (!cancelled) setter(data);
        })
        .catch(() => {
          if (!cancelled) setter([]);
        });

    load('builds.json', setBuilds);
    load('build_failures.json', setBuildFailures);
    load('tests.json', setTests);
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

  const contextLabel = job ? (job.prinfo ? `PR #${job.prinfo.number}` : refRepr(job)) : '';
  const stateSuffix =
    job?.state === 'passed' ? ' - Passed' : job?.state === 'errored' ? ' - Failed' : '';
  useDocumentTitle(
    job ? `Murdock - ${contextLabel} - ${job.commit.sha.slice(0, 7)}${stateSuffix}` : 'Murdock',
  );
  useFavicon(
    job?.state === 'passed' ? '/passed.png' : job?.state === 'errored' ? '/failed.png' : '/favicon.ico',
  );

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
  const hasFailedBuilds =
    (buildFailures?.length ?? 0) > 0 || (status?.failed_builds?.length ?? 0) > 0;
  const hasFailedTests = (testFailures?.length ?? 0) > 0 || (status?.failed_tests?.length ?? 0) > 0;
  const buildsAvailable = (builds?.length ?? 0) > 0 || (status?.failed_builds?.length ?? 0) > 0;
  const testsAvailable = (tests?.length ?? 0) > 0 || (status?.failed_tests?.length ?? 0) > 0;
  const detailsAvailable = 'fasttracked' in job && 'trigger' in job && Boolean(job.env);
  const artifactsAvailable = (job.artifacts?.length ?? 0) > 0;
  const statsAvailable = (stats?.total_jobs ?? 0) > 0;
  const outputAvailable = job.state !== 'queued';

  const requestedTab = routeParams.tab;
  const activeTab = (() => {
    if (requestedTab && RESULT_TABS.includes(requestedTab)) return requestedTab;
    if (buildsAvailable && ['passed', 'errored'].includes(job.state)) return 'builds';
    if ((status?.failed_builds?.length ?? 0) > 0 && ['stopped', 'running'].includes(job.state)) {
      return 'builds';
    }
    if (job.state === 'queued') return 'details';
    return 'output';
  })();

  return (
    <>
      <article className="box job-header" data-state={job.state}>
        <JobHeader job={job} canManage={canManage} onAction={onAction} busy={busy} />
        <div className="box-body">
          <JobInfo job={job} />
          <JobProgress job={job} status={status} />
        </div>
      </article>

      <div className="m-2">
        <nav className="tabs" aria-label="Job sections">
          {buildsAvailable && (
            <Tab
              path={path}
              id="builds"
              active={activeTab === 'builds'}
              label="Builds"
              icon={hasFailedBuilds ? 'cross' : 'check'}
              tone={hasFailedBuilds ? 'errored' : 'passed'}
            />
          )}
          {testsAvailable && (
            <Tab
              path={path}
              id="tests"
              active={activeTab === 'tests'}
              label="Tests"
              icon={hasFailedTests ? 'cross' : 'check'}
              tone={hasFailedTests ? 'errored' : 'passed'}
            />
          )}
          {outputAvailable && (
            <Tab path={path} id="output" active={activeTab === 'output'} label="Output" icon="fileText" />
          )}
          {artifactsAvailable && (
            <Tab
              path={path}
              id="artifacts"
              active={activeTab === 'artifacts'}
              label="Artifacts"
              icon="files"
            />
          )}
          {detailsAvailable && (
            <Tab path={path} id="details" active={activeTab === 'details'} label="Details" icon="info" />
          )}
          {statsAvailable && (
            <Tab path={path} id="stats" active={activeTab === 'stats'} label="Stats" icon="chart" />
          )}
        </nav>

        <div className="tab-panel">
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
