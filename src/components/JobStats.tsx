import { useState } from 'react';
import type { Stats, WorkerStats } from '../types';
import card from '../styles/card.module.css';
import controls from '../styles/controls.module.css';
import misc from '../styles/misc.module.css';
import results from '../styles/results.module.css';

interface WorkerRowProps {
  worker: WorkerStats;
}

function WorkerRow({ worker }: WorkerRowProps) {
  return (
    <tr>
      <th style={{ maxWidth: 320, overflowWrap: 'anywhere' }}>{worker.name}</th>
      <td>{worker.runtime_avg.toFixed(2)}</td>
      <td className={misc.hideSm}>{worker.runtime_min.toFixed(2)}</td>
      <td className={misc.hideSm}>{worker.runtime_max.toFixed(2)}</td>
      <td className={misc.hideSm}>{worker.total_cpu_time.toFixed(2)}</td>
      <td>{worker.jobs_passed}</td>
      <td>{worker.jobs_failed}</td>
      <td>{worker.jobs_count}</td>
    </tr>
  );
}

interface JobStatsProps {
  stats: Stats;
}

export function JobStats({ stats }: JobStatsProps) {
  const [filter, setFilter] = useState('');
  const workers = (stats.workers ?? []).filter((worker) => worker.name.includes(filter));

  return (
    <>
      <div className={card.card}>
        <div className={card.cardHeader}>Global stats</div>
        <div className={card.cardBody}>
          <ul className={misc.plainList}>
            {stats.total_builds! > 0 && <li>Total builds: {stats.total_builds}</li>}
            {stats.total_tests! > 0 && <li>Total tests: {stats.total_tests}</li>}
            {stats.total_builds! > 0 && stats.total_tests! > 0 && <li>Total jobs: {stats.total_jobs}</li>}
            <li>Total CPU time: {stats.total_time}</li>
          </ul>
        </div>
      </div>

      <div className={card.card}>
        <div className={card.cardHeader}>
          <span>Workers ({workers.length})</span>
          <input
            className={controls.input}
            type="text"
            placeholder="Filter workers"
            value={filter}
            onChange={(event) => setFilter(event.target.value)}
          />
        </div>
        <div className={card.cardBody}>
          <div className={results.tableWrap}>
            <table className={results.table}>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Average (s)</th>
                  <th className={misc.hideSm}>Min (s)</th>
                  <th className={misc.hideSm}>Max (s)</th>
                  <th className={misc.hideSm}>CPU (s)</th>
                  <th>Passed</th>
                  <th>Failed</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {workers.map((worker) => (
                  <WorkerRow key={worker.name} worker={worker} />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}
