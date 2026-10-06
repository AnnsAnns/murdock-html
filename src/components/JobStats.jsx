import { useState } from 'react';

function WorkerRow({ worker }) {
  return (
    <tr>
      <th style={{ maxWidth: 320, overflowWrap: 'anywhere' }}>{worker.name}</th>
      <td>{worker.runtime_avg.toFixed(2)}</td>
      <td className="hide-sm">{worker.runtime_min.toFixed(2)}</td>
      <td className="hide-sm">{worker.runtime_max.toFixed(2)}</td>
      <td className="hide-sm">{worker.total_cpu_time.toFixed(2)}</td>
      <td>{worker.jobs_passed}</td>
      <td>{worker.jobs_failed}</td>
      <td>{worker.jobs_count}</td>
    </tr>
  );
}

export function JobStats({ stats }) {
  const [filter, setFilter] = useState('');
  const workers = (stats.workers ?? []).filter((worker) => worker.name.includes(filter));

  return (
    <>
      <div className="card">
        <div className="card-header">Global stats</div>
        <div className="card-body">
          <ul className="plain-list">
            {stats.total_builds > 0 && <li>Total builds: {stats.total_builds}</li>}
            {stats.total_tests > 0 && <li>Total tests: {stats.total_tests}</li>}
            {stats.total_builds > 0 && stats.total_tests > 0 && <li>Total jobs: {stats.total_jobs}</li>}
            <li>Total CPU time: {stats.total_time}</li>
          </ul>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <span>Workers ({workers.length})</span>
          <input
            className="input"
            type="text"
            placeholder="Filter workers"
            value={filter}
            onChange={(event) => setFilter(event.target.value)}
          />
        </div>
        <div className="card-body">
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Average (s)</th>
                  <th className="hide-sm">Min (s)</th>
                  <th className="hide-sm">Max (s)</th>
                  <th className="hide-sm">CPU (s)</th>
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
