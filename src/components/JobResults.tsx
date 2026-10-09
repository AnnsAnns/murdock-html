import { useState } from 'react';
import { Link } from 'react-router-dom';
import card from '../styles/card.module.css';
import controls from '../styles/controls.module.css';
import results from '../styles/results.module.css';
import { stateIcon } from '../utils/state';
import { Icon } from './Icon';
import { Result } from './Result';
import type { Job, JobStatus, ResultItem, Stats } from '../types';

interface ApplicationRowProps {
  uid: string;
  type: string;
  name: string;
  success?: number;
  failures?: number;
}

function ApplicationRow({ uid, type, name, success, failures }: ApplicationRowProps) {
  const state = failures ? 'errored' : 'passed';
  return (
    <Link
      className={results.applicationRow}
      to={`/details/${uid}/${type}/${encodeURIComponent(name.replaceAll('/', ':'))}`}
    >
      <span className={controls.stateFg} data-state={state}>
        <Icon name={stateIcon(state)} />
      </span>
      <span className={results.applicationName}>{name}</span>
      <span className={results.applicationCounts}>
        {(failures ?? 0) > 0 && (
          <span className={controls.statePill} data-state="errored">
            {failures} failed
          </span>
        )}
        {(success ?? 0) > 0 && (
          <span className={controls.statePill} data-state="passed">
            {success} success
          </span>
        )}
      </span>
    </Link>
  );
}

interface ResultsListProps {
  kind: 'builds' | 'tests';
  uid: string;
  results: ResultItem[] | null;
  failures: ResultItem[] | null;
  liveFailures?: ResultItem[];
  job: Job;
  stats?: Stats | null;
}

function ResultsList({ kind, uid, results, failures, liveFailures, job, stats }: ResultsListProps) {
  const [filter, setFilter] = useState('');
  const [failuresFilter, setFailuresFilter] = useState('');

  const list = (results ?? []).filter((result) => result.application.includes(filter));

  // tests.json embeds a `failures` array per application; fall back to it when
  // the dedicated *_failures.json file is empty or missing.
  const effectiveFailures =
    kind === 'tests' && !(failures?.length)
      ? (results ?? []).flatMap((result) => result.failures ?? [])
      : (failures ?? []);

  const failed = effectiveFailures.filter(
    (result) => result.application.includes(failuresFilter) || result.target.includes(failuresFilter),
  );
  const live = (liveFailures ?? []).filter((result) => result.application);

  const noun = kind === 'builds' ? 'builds' : 'tests';
  const total = kind === 'builds' ? stats?.total_builds : stats?.total_tests;
  const successKey = kind === 'builds' ? 'build_success' : 'test_success';
  const failureKey = kind === 'builds' ? 'build_failures' : 'test_failures';

  return (
    <>
      {(effectiveFailures?.length ?? 0) > 0 && (
        <div className={`${card.card} ${card.isDanger}`}>
          <div className={`${card.cardHeader} ${card.isDanger}`}>
            <span>
              Failed {noun} ({failed.length}/{total ?? '?'})
            </span>
            <input
              className={controls.input}
              type="text"
              placeholder={`Filter failed ${noun}`}
              value={failuresFilter}
              onChange={(event) => setFailuresFilter(event.target.value)}
            />
          </div>
          <div className={card.cardBody}>
            {failed.map((result) => (
              <Result
                key={`${result.application}-${result.target}-${result.toolchain}`}
                uid={uid}
                type={kind}
                withApplication
                result={result}
                job={job}
              />
            ))}
          </div>
        </div>
      )}

      {['running', 'stopped'].includes(job.state) && live.length > 0 && (
        <div className={`${card.card} ${card.isDanger}`}>
          <div className={`${card.cardHeader} ${card.isDanger}`}>
            <span>
              Failed {noun} ({live.length})
            </span>
          </div>
          <div className={card.cardBody}>
            {live.map((result) => (
              <Result
                key={`${result.application}-${result.target}-${result.toolchain}`}
                uid={uid}
                type={kind}
                withApplication
                result={result}
                job={job}
              />
            ))}
          </div>
        </div>
      )}

      {['errored', 'passed'].includes(job.state) && (
        <div className={card.card}>
          <div className={card.cardHeader}>
            <span>Applications ({list.length})</span>
            <input
              className={controls.input}
              type="text"
              placeholder="Filter applications"
              value={filter}
              onChange={(event) => setFilter(event.target.value)}
            />
          </div>
          <div className={card.cardBody}>
            {list.map((result) => (
              <ApplicationRow
                key={result.application}
                uid={uid}
                type={kind}
                name={result.application}
                success={result[successKey as keyof ResultItem] as number | undefined}
                failures={result[failureKey as keyof ResultItem] as number | undefined}
              />
            ))}
          </div>
        </div>
      )}
    </>
  );
}

export interface JobBuildsProps {
  uid: string;
  builds: ResultItem[] | null;
  buildFailures: ResultItem[] | null;
  job: Job;
  status?: JobStatus;
  stats?: Stats | null;
}

export function JobBuilds({ uid, builds, buildFailures, job, status, stats }: JobBuildsProps) {
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

export interface JobTestsProps {
  uid: string;
  tests: ResultItem[] | null;
  testFailures: ResultItem[] | null;
  job: Job;
  status?: JobStatus;
  stats?: Stats | null;
}

export function JobTests({ uid, tests, testFailures, job, status, stats }: JobTestsProps) {
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
