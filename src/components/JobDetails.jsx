import card from '../styles/card.module.css';
import results from '../styles/results.module.css';

export function JobDetails({ job }) {
  const env = Object.entries(job.env ?? {}).sort(([a], [b]) => a.localeCompare(b));

  return (
    <div className={card.cardGrid}>
      <div className={card.card}>
        <div className={card.cardHeader}>Context</div>
        <div className={card.cardBody}>
          <table className={results.table}>
            <tbody>
              {'triggered_by' in job && (
                <tr>
                  <td>Triggered by</td>
                  <td>{job.triggered_by}</td>
                </tr>
              )}
              <tr>
                <td>Trigger type</td>
                <td>{job.trigger}</td>
              </tr>
              <tr>
                <td>Fasttracked</td>
                <td>{job.fasttracked ? 'True' : 'False'}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div className={card.card}>
        <div className={card.cardHeader}>Environment</div>
        <div className={card.cardBody}>
          {env.length ? (
            <table className={results.table}>
              <tbody>
                {env.map(([key, value]) => (
                  <tr key={key}>
                    <td>{key}</td>
                    <td style={{ overflowWrap: 'anywhere' }}>{value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="muted">No environment variables.</p>
          )}
        </div>
      </div>
    </div>
  );
}
