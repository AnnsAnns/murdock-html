import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getApplicationResults } from '../api/murdock';
import { Icon } from '../components/Icon';
import { Result } from '../components/Result';
import { Spinner } from '../components/Spinner';
import { useDocumentTitle } from '../hooks/useDocumentTitle';

export function ApplicationResultsPage({ type }) {
  const { uid, application } = useParams();
  const navigate = useNavigate();
  const appPath = useMemo(() => (application ?? '').replaceAll(':', '/'), [application]);

  const [data, setData] = useState(null);
  const [filter, setFilter] = useState('');
  const [failuresFilter, setFailuresFilter] = useState('');

  const typeLabel = type.charAt(0).toUpperCase() + type.slice(1);
  useDocumentTitle(`Murfrog - ${appPath} ${type}`);

  useEffect(() => {
    const controller = new AbortController();
    setData(null);
    getApplicationResults(uid, type, appPath, controller.signal)
      .then(setData)
      .catch(() => setData({}));
    return () => controller.abort();
  }, [uid, type, appPath]);

  const jobs = data?.jobs ?? [];
  const failures = data?.failures ?? [];
  const filteredJobs = jobs.filter((result) => result.target.includes(filter));
  const filteredFailures = failures.filter((result) => result.target.includes(failuresFilter));

  const runtimeStats = jobs.length
    ? {
        avg: jobs.reduce((total, job) => total + job.runtime, 0) / jobs.length,
        min: jobs.reduce((min, job) => Math.min(min, job.runtime), Infinity),
        max: jobs.reduce((max, job) => Math.max(max, job.runtime), 0),
        total: jobs.reduce((total, job) => total + job.runtime, 0),
      }
    : null;

  return (
    <>
      <button type="button" className="btn btn--ghost" onClick={() => navigate(-1)}>
        <Icon name="chevronLeft" />
        <span>Back to job {type}</span>
      </button>

      {!data ? (
        <Spinner />
      ) : (
        <>
          <div className="card">
            <div className="card-header">
              {typeLabel}: {appPath}
            </div>
            {runtimeStats && (
              <div className="card-body">
                <div className="table-wrap">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Average (s)</th>
                        <th>Min (s)</th>
                        <th>Max (s)</th>
                        <th>Total CPU (s)</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>{runtimeStats.avg.toFixed(2)}</td>
                        <td>{runtimeStats.min.toFixed(2)}</td>
                        <td>{runtimeStats.max.toFixed(2)}</td>
                        <td>{runtimeStats.total.toFixed(2)}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          {failures.length > 0 && (
            <div className="card is-danger">
              <div className="card-header is-danger">
                <span>
                  Failed {type} ({filteredFailures.length}/{jobs.length})
                </span>
                <input
                  className="input"
                  type="text"
                  placeholder={`Filter failed ${type}`}
                  value={failuresFilter}
                  onChange={(event) => setFailuresFilter(event.target.value)}
                />
              </div>
              <div className="card-body">
                {filteredFailures.map((result) => (
                  <Result
                    key={`${result.application}-${result.target}-${result.toolchain}`}
                    uid={uid}
                    type={type}
                    result={result}
                  />
                ))}
              </div>
            </div>
          )}

          <div className="card">
            <div className="card-header">
              <span>
                {typeLabel} ({filteredJobs.length})
              </span>
              <input
                className="input"
                type="text"
                placeholder={`Filter ${type}`}
                value={filter}
                onChange={(event) => setFilter(event.target.value)}
              />
            </div>
            <div className="card-body">
              {filteredJobs.map((result) => (
                <Result
                  key={`${result.application}-${result.target}-${result.toolchain}`}
                  uid={uid}
                  type={type}
                  result={result}
                />
              ))}
            </div>
          </div>
        </>
      )}
    </>
  );
}
