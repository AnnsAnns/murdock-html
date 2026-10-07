import type { ReactNode } from 'react';
import { GITHUB_REPO } from '../api/config';
import misc from '../styles/misc.module.css';
import jobDetail from './JobInfo.module.css';
import { Icon } from './Icon';

function linkify(text: string, keyPrefix: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  const regex = /#(\d+)/g;
  let last = 0;
  let match;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > last) nodes.push(text.slice(last, match.index));
    nodes.push(
      <a
        key={`${keyPrefix}-${match.index}`}
        href={`https://github.com/${GITHUB_REPO}/issues/${match[1]}`}
        target="_blank"
        rel="noreferrer noopener"
      >
        #{match[1]}
      </a>,
    );
    last = regex.lastIndex;
  }

  if (last < text.length) nodes.push(text.slice(last));
  return nodes;
}

interface CommitMessageProps {
  message: string;
}

/** Commit message with GitHub issue references turned into links. */
export function CommitMessage({ message }: CommitMessageProps) {
  const [first, ...rest] = message.split('\n');

  return (
    <>
      <span>{linkify(first, 'first')}</span>
      {rest.length > 0 && (
        <details className={misc.commitExtraDetails}>
          <summary title="Show full commit message">
            <Icon name="expand" />
          </summary>
          <div className={jobDetail.commitExtra}>
            {rest.map((line, index) => (
              <div key={index}>{linkify(line, `line-${index}`)}</div>
            ))}
          </div>
        </details>
      )}
    </>
  );
}
