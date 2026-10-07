import { JobRow } from './JobRow';

export function JobList({ jobs, canManage, onAction, queuedStarts }) {
  return (
    <div className="panel">
      <div className="job-list-head" aria-hidden="true">
        <span>Job</span>
        <span>Title</span>
        <span>Start Date</span>
        <span>End Date</span>
        <span>Duration</span>
        <span className="text-end">State</span>
      </div>
      <ul className="job-list">
        {jobs.map((job) => (
          <JobRow
            key={job.uid}
            job={job}
            canManage={canManage}
            onAction={onAction}
            queuedStarts={queuedStarts}
          />
        ))}
      </ul>
    </div>
  );
}
