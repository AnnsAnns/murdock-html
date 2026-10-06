import { useState } from 'react';
import { Link } from 'react-router-dom';
import { stateIcon } from '../utils/state';
import { Icon } from './Icon';
import { Result } from './Result';

function ApplicationRow({ uid, type, name, success, failures }) {
  const state = failures ? 'errored' : 'passed';
  return (
    <Link
      className="application-row"
      to={`/details/${uid}/${type}/${encodeURIComponent(name.replaceAll('/', ':'))}`}
    >
      <span className="state-fg" data-state={state}>
        <Icon name={stateIcon(state)} />
      </span>
      <span className="application-name">{name}</span>
      <span className="application-counts">
        {failures > 0 && (
          <span className="state-pill" data-state="errored">
            {failures} failed
          </span>
        )}
        {success > 0 && (
          <span className="state-pill" data-state="passed">
            {success} success
          </span>
        )}
      </span>
    </Link>
  );
}

function ResultsList({ kind, uid, results, failures, liveFailures, job, stats }) {
  const [filter, setFilter] = useState('');
  const [failuresFilter, setFailuresFilter] = useState('');

  const list = (results ?? []).filter((result) => result.application.includes(filter));
  const failed = (failures ?? []).filter(
    (result) => result.application.includes(failuresFilter) || result.target.includes(failuresFilter),
  );
  const live = (liveFailures ?? []).filter((result) => result.application);

  const noun = kind === 'builds' ? 'builds' : 'tests';
  const total = kind === 'builds' ? stats?.total_builds : stats?.total_tests;
  const successKey = kind === 'builds' ? 'build_success' : 'test_success';
  const failureKey = kind === 'builds' ? 'build_failures' : 'test_failures';

  return (
    <>
      {(failures?.length ?? 0) > 0 && (
        <div className="card is-danger">
          <div className="card-header is-danger">
            <span>
              Failed {noun} ({failed.length}/{total ?? '?'})
            </span>
            <input
              className="input"
              type="text"
              placeholder={`Filter failed ${noun}`}
              value={failuresFilter}
              onChange={(event) => setFailuresFilter(event.target.value)}
            />
          </div>
          <div className="card-body">
            {failed.map((result) => (
              <Result
                key={`${result.application}-${result.target}-${result.toolchain}`}
                uid={uid}
                type={kind}
                withApplication
                result={result}
              />
            ))}
          </div>
        </div>
      )}

      {['running', 'stopped'].includes(job.state) && live.length > 0 && (
        <div className="card is-danger">
          <div className="card-header is-danger">
            <span>
              Failed {noun} ({live.length})
            </span>
          </div>
          <div className="card-body">
            {live.map((result) => (
              <Result
                key={`${result.application}-${result.target}-${result.toolchain}`}
                uid={uid}
                type={kind}
                withApplication
                result={result}
              />
            ))}
          </div>
        </div>
      )}

      {['errored', 'passed'].includes(job.state) && (
        <div className="card">
          <div className="card-header">
            <span>Applications ({list.length})</span>
            <input
              className="input"
              type="text"
              placeholder="Filter applications"
              value={filter}
              onChange={(event) => setFilter(event.target.value)}
            />
          </div>
          <div className="card-body">
            {list.map((result) => (
              <ApplicationRow
                key={result.application}
                uid={uid}
                type={kind}
                name={result.application}
                success={result[successKey]}
                failures={result[failureKey]}
              />
            ))}
          </div>
        </div>
      )}
    </>
  );
}

export function JobBuilds({ uid, builds, buildFailures, job, status, stats }) {
  return (
    <ResultsList
      kind="builds"
      uid={uid}
      results={builds}
      failures={buildFailures}
      liveFailures={status?.failed_builds}
      job={job}
      stats={stats}
    />
  );
}

export function JobTests({ uid, tests, testFailures, job, status, stats }) {
  return (
    <ResultsList
      kind="tests"
      uid={uid}
      results={tests}
      failures={testFailures}
      liveFailures={status?.failed_tests}
      job={job}
      stats={stats}
    />
  );
}
