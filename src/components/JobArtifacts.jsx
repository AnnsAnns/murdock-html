import { API_BASE } from '../api/config';
import { Icon } from './Icon';

export function JobArtifacts({ job }) {
  const artifacts = job.artifacts ?? [];

  return (
    <div className="card">
      <div className="card-body">
        {artifacts.length ? (
          <ul className="artifact-list">
            {artifacts.map((artifact) => (
              <li key={artifact}>
                <a
                  href={`${API_BASE}/results/${job.uid}/${artifact}`}
                  target="_blank"
                  rel="noreferrer noopener"
                >
                  <Icon name="files" />
                  {artifact}
                </a>
              </li>
            ))}
          </ul>
        ) : (
          <p className="muted">No artifacts.</p>
        )}
      </div>
    </div>
  );
}
