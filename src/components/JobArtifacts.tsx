import type { Job } from '../types';
import { API_BASE } from '../api/config';
import card from '../styles/card.module.css';
import results from '../styles/results.module.css';
import { Icon } from './Icon';

interface JobArtifactsProps {
  job: Job;
}

export function JobArtifacts({ job }: JobArtifactsProps) {
  const artifacts = job.artifacts ?? [];

  return (
    <div className={card.card}>
      <div className={card.cardBody}>
        {artifacts.length ? (
          <ul className={results.artifactList}>
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
