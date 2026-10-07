import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { GITHUB_REPO, ITEMS_DISPLAYED_STEP } from '../api/config';
import { deleteJob, getJobs, restartJob } from '../api/murdock';
import {
  queryParamsToApiQuery,
  queryParamsToSearchParams,
  queryStringToQueryParams,
} from '../api/query';
import { useAuth } from '../auth/AuthContext';
import { CurrentJob } from '../components/CurrentJob';
import { JobActions } from '../components/JobActions';
import { JobFilters } from '../components/JobFilters';
import { JobList } from '../components/JobList';
import { JobSection } from '../components/JobSection';
import { ShowMore } from '../components/ShowMore';
import { Spinner } from '../components/Spinner';
import { useToast } from '../components/Toast';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { useMurdockSocket } from '../hooks/useMurdockSocket';
import { estimateQueuedStarts, jobContext } from '../utils/job';
import { FINISHED_STATES } from '../utils/state';

// How many running/queued jobs to look at when estimating queued start times.
const QUEUE_LOOKAHEAD = 100;

export function JobListPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const params = useMemo(() => queryStringToQueryParams(searchParams.toString()), [searchParams]);
  const apiQuery = useMemo(() => queryParamsToApiQuery(params), [params]);

  const [jobs, setJobs] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [refreshToken, setRefreshToken] = useState(0);
  const [queue, setQueue] = useState([]);
  const [expandedUid, setExpandedUid] = useState(null);
  const [draft, setDraft] = useState({
    sha: params.sha,
    author: params.author,
    prnum: params.prnum,
    branch: params.branch,
    tag: params.tag,
  });

  const { canManage, user } = useAuth();
  const { notify } = useToast();

  useDocumentTitle(`Murdock - ${GITHUB_REPO}`);

  // Keep the local text draft in sync with the committed query params.
  useEffect(() => {
    setDraft({
      sha: params.sha,
      author: params.author,
      prnum: params.prnum,
      branch: params.branch,
      tag: params.tag,
    });
  }, [params.sha, params.author, params.prnum, params.branch, params.tag]);

  useEffect(() => {
    const controller = new AbortController();
    setLoaded(false);
    getJobs(apiQuery, controller.signal)
      .then((data) => {
        setJobs(data);
        setLoaded(true);
      })
      .catch((error) => {
        if (error.name === 'AbortError') return;
        setJobs([]);
        setLoaded(true);
      });
    return () => controller.abort();
  }, [apiQuery, refreshToken]);

  // Track the running and queued jobs to estimate when a queued job will start:
  // each job ahead of it in the queue contributes its estimated runtime (a
  // running job its live ETA, a queued one its runtime guessed from the CI
  // flags). Fetched independently of the dashboard filters so it stays
  // available when filtering by queued only.
  useEffect(() => {
    const controller = new AbortController();
    getJobs(`limit=${QUEUE_LOOKAHEAD}&states=running+queued`, controller.signal)
      .then(setQueue)
      .catch(() => setQueue([]));
    return () => controller.abort();
  }, [refreshToken]);

  const queuedStarts = useMemo(() => estimateQueuedStarts(queue), [queue]);

  useMurdockSocket((message) => {
    if (message.cmd === 'reload') {
      setRefreshToken((token) => token + 1);
    } else if (message.cmd === 'status') {
      setJobs((list) =>
        list.map((job) => (job.uid === message.uid ? { ...job, status: message.status } : job)),
      );
      setQueue((list) =>
        list.map((job) => (job.uid === message.uid ? { ...job, status: message.status } : job)),
      );
    } else if (message.cmd === 'output') {
      setJobs((list) =>
        list.map((job) =>
          job.uid === message.uid ? { ...job, output: `${job.output ?? ''}${message.line}` } : job,
        ),
      );
    }
  });

  const update = useCallback(
    (patch) => setSearchParams(queryParamsToSearchParams({ ...params, ...patch })),
    [params, setSearchParams],
  );

  const onType = (type) => update({ type });
  const onToggleState = (state) =>
    update({
      states: params.states.includes(state)
        ? params.states.filter((entry) => entry !== state)
        : [...params.states, state],
    });
  const onTogglePrState = (key) =>
    update({ prstates: { ...params.prstates, [key]: !params.prstates[key] } });
  const onDraftChange = (field, value) => setDraft((current) => ({ ...current, [field]: value }));
  const onCommit = () => update(draft);
  const showMore = () => update({ limit: Number(params.limit) + ITEMS_DISPLAYED_STEP });
  const toggleExpand = useCallback(
    (uid) => setExpandedUid((current) => (current === uid ? null : uid)),
    [],
  );

  const onAction = useCallback(
    async (job, action) => {
      try {
        if (action === 'restart') {
          const restarted = await restartJob(job.uid, user.token);
          notify(`Job ${restarted.uid.slice(0, 7)} ${jobContext(job)} started`);
          setRefreshToken((token) => token + 1);
        } else {
          await deleteJob(job.uid, user.token);
          notify(
            `${action === 'cancel' ? 'Cancelling' : 'Stopping'} job ${job.uid.slice(0, 7)} ${jobContext(job)}`,
          );
        }
      } catch {
        notify(`Failed to ${action} job ${job.uid.slice(0, 7)} ${jobContext(job)}`, 'danger');
      }
    },
    [notify, user],
  );

  // The dashboard groups the (filtered) job stream into three panels.
  const running = jobs.find((job) => job.state === 'running');
  const queued = jobs.filter((job) => job.state === 'queued');
  const past = jobs.filter((job) => FINISHED_STATES.includes(job.state));
  const hasMore = jobs.length >= Number(params.limit);

  return (
    <>
      <JobFilters
        params={params}
        draft={draft}
        onType={onType}
        onToggleState={onToggleState}
        onTogglePrState={onTogglePrState}
        onDraftChange={onDraftChange}
        onCommit={onCommit}
      />

      {!loaded ? (
        <Spinner />
      ) : jobs.length ? (
        <div className="dashboard">
          <JobSection
            title="Current Job"
            icon="gear"
            state={running?.state}
            action={
              running && (
                <JobActions
                  job={running}
                  canManage={canManage}
                  onAction={(action) => onAction(running, action)}
                />
              )
            }
          >
            {running ? (
              <CurrentJob job={running} />
            ) : (
              <p className="muted">No job is running right now.</p>
            )}
          </JobSection>

          <JobSection
            title="Queued Jobs"
            icon="inbox"
            state={queued.length ? 'queued' : undefined}
            count={queued.length}
          >
            {queued.length ? (
              <JobList
                jobs={queued}
                canManage={canManage}
                onAction={onAction}
                queuedStarts={queuedStarts}
                expandedUid={expandedUid}
                onToggleExpand={toggleExpand}
              />
            ) : (
              <p className="muted">The queue is empty.</p>
            )}
          </JobSection>

          <JobSection title="Past Jobs" icon="clock" count={past.length}>
            {past.length ? (
              <>
                <JobList
                  jobs={past}
                  canManage={canManage}
                  onAction={onAction}
                  queuedStarts={queuedStarts}
                  expandedUid={expandedUid}
                  onToggleExpand={toggleExpand}
                />
                {hasMore && <ShowMore onClick={showMore} />}
              </>
            ) : (
              <p className="muted">No finished jobs match.</p>
            )}
          </JobSection>
        </div>
      ) : (
        <div className="empty-state">No job matching</div>
      )}
    </>
  );
}
