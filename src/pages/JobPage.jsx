import { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { JobDetail } from '../components/JobDetail';
import { useDocumentTitle, useFavicon } from '../hooks/useDocumentTitle';
import { refRepr } from '../utils/job';

export function JobPage() {
  const routeParams = useParams();

  // The API path is a uid or `branch/{x}`, `tag/{x}`, `commit/{sha}`, `pr/{n}`.
  const path = useMemo(() => {
    if (routeParams.branch) return `branch/${routeParams.branch}`;
    if (routeParams.tag) return `tag/${routeParams.tag}`;
    if (routeParams.commit) return `commit/${routeParams.commit}`;
    if (routeParams.prnum) return `pr/${routeParams.prnum}`;
    return routeParams.uid;
  }, [routeParams]);

  // Mirror the loaded job into the document title/favicon; the detail view
  // itself owns fetching and rendering.
  const [job, setJob] = useState(null);
  const onJobLoaded = useCallback((next) => setJob(next), []);

  useEffect(() => {
    setJob(null);
  }, [path]);

  const contextLabel = job ? (job.prinfo ? `PR #${job.prinfo.number}` : refRepr(job)) : '';
  const stateSuffix =
    job?.state === 'passed' ? ' - Passed' : job?.state === 'errored' ? ' - Failed' : '';
  useDocumentTitle(
    job ? `Murdock - ${contextLabel} - ${job.commit.sha.slice(0, 7)}${stateSuffix}` : 'Murdock',
  );
  useFavicon(
    job?.state === 'passed' ? '/passed.png' : job?.state === 'errored' ? '/failed.png' : '/favicon.ico',
  );

  const tabHref = useCallback((id) => `/details/${path}/${id}`, [path]);

  return (
    <JobDetail
      path={path}
      activeTab={routeParams.tab}
      tabHref={tabHref}
      onJobLoaded={onJobLoaded}
    />
  );
}
