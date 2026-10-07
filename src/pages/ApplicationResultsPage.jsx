import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getApplicationResults } from '../api/murdock';
import { Icon } from '../components/Icon';
import { Result } from '../components/Result';
import { Spinner } from '../components/Spinner';
import card from '../styles/card.module.css';
import controls from '../styles/controls.module.css';
import results from '../styles/results.module.css';
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
      <button
        type="button"
        className={`${controls.btn} ${controls.btnGhost}`}
        onClick={() => navigate(-1)}
      >
        <Icon name="chevronLeft" />
        <span>Back to job {type}</span>
      </button>

      {!data ? (
        <Spinner />
      ) : (
        <>
          <div className={card.card}>
            <div className={card.cardHeader}>
              {typeLabel}: {appPath}
            </div>
            {runtimeStats && (
              <div className={card.cardBody}>
                <div className={results.tableWrap}>
                  <table className={results.table}>
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
            <div className={`${card.card} ${card.isDanger}`}>
              <div className={`${card.cardHeader} ${card.isDanger}`}>
                <span>
                  Failed {type} ({filteredFailures.length}/{jobs.length})
                </span>
                <input
                  className={controls.input}
                  type="text"
                  placeholder={`Filter failed ${type}`}
                  value={failuresFilter}
                  onChange={(event) => setFailuresFilter(event.target.value)}
                />
              </div>
              <div className={card.cardBody}>
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

          <div className={card.card}>
            <div className={card.cardHeader}>
              <span>
                {typeLabel} ({filteredJobs.length})
              </span>
              <input
                className={controls.input}
                type="text"
                placeholder={`Filter ${type}`}
                value={filter}
                onChange={(event) => setFilter(event.target.value)}
              />
            </div>
            <div className={card.cardBody}>
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
