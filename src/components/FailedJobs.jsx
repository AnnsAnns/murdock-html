import card from '../styles/card.module.css';
import misc from '../styles/misc.module.css';
import controls from '../styles/controls.module.css';

/** Job-level failures (`status.failed_jobs`), when the API reports them. */
export function FailedJobs({ jobs }) {
  if (!jobs?.length) return null;

  return (
    <div className={`${card.card} ${card.isDanger}`}>
      <div className={`${card.cardHeader} ${card.isDanger}`}>
        <span>Job failures ({jobs.length})</span>
      </div>
      <div className={card.cardBody}>
        <ul className={misc.failureList}>
          {jobs.map((item, index) => {
            const label = item.name ?? item.application ?? item.target ?? `failure ${index + 1}`;
            return (
              <li key={`${label}-${index}`}>
                {item.href ? (
                  <a
                    className={controls.stateFg}
                    data-state="errored"
                    href={item.href}
                    target="_blank"
                    rel="noreferrer noopener"
                  >
                    {label}
                  </a>
                ) : (
                  label
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
