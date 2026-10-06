/** Job-level failures (`status.failed_jobs`), when the API reports them. */
export function FailedJobs({ jobs }) {
  if (!jobs?.length) return null;

  return (
    <div className="card is-danger">
      <div className="card-header is-danger">
        <span>Job failures ({jobs.length})</span>
      </div>
      <div className="card-body">
        <ul className="failure-list">
          {jobs.map((item, index) => {
            const label = item.name ?? item.application ?? item.target ?? `failure ${index + 1}`;
            return (
              <li key={`${label}-${index}`}>
                {item.href ? (
                  <a
                    className="state-fg"
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
