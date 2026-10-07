import { Fragment } from 'react';
import { JobDetail } from './JobDetail';
import { JobRow } from './JobRow';

/** Column header + rows. The surrounding section provides the panel chrome. */
export function JobList({
  jobs,
  canManage,
  onAction,
  queuedStarts,
  expandedUid,
  onToggleExpand,
}) {
  return (
    <>
      <div className="job-list-head" aria-hidden="true">
        <span>Job</span>
        <span>Title</span>
        <span>Start Date</span>
        <span>End Date</span>
        <span>Duration</span>
        <span className="text-end">State</span>
      </div>
      <ul className="job-list">
        {jobs.map((job) => {
          const expanded = expandedUid === job.uid;
          return (
            <Fragment key={job.uid}>
              <JobRow
                job={job}
                canManage={canManage}
                onAction={(action) => onAction(job, action)}
                queuedStarts={queuedStarts}
                expanded={expanded}
                onToggle={() => onToggleExpand?.(job.uid)}
              />
              {expanded && (
                <li className="job-embed" data-state={job.state}>
                  {/* Mounted on demand, so nothing is fetched until expanded. */}
                  <JobDetail path={job.uid} />
                </li>
              )}
            </Fragment>
          );
        })}
      </ul>
    </>
  );
}
