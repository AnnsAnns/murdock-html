import { JobRow } from './JobRow';

export function JobList({ jobs, canManage, onAction }) {
  return (
    <div className="panel">
      <div className="job-list-head" aria-hidden="true">
        <span>Job</span>
        <span>Title</span>
        <span>Date</span>
        <span>Duration</span>
        <span className="text-end">State</span>
      </div>
      <ul className="job-list">
        {jobs.map((job) => (
          <JobRow key={job.uid} job={job} canManage={canManage} onAction={onAction} />
        ))}
      </ul>
    </div>
  );
}
