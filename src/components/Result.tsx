import { useState } from 'react';
import { API_BASE } from '../api/config';
import { fetchText, getResultOutputUrl } from '../api/murdock';
import controls from '../styles/controls.module.css';
import results from '../styles/results.module.css';
import { stateIcon } from '../utils/state';
import { Icon } from './Icon';
import type { ResultItem } from '../types';

export interface ResultProps {
  uid: string;
  type: string;
  result: ResultItem;
  withApplication?: boolean;
}

/** One target/toolchain result, expanding to its raw output. */
export function Result({ uid, type, result, withApplication = false }: ResultProps) {
  const [output, setOutput] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  const outputPath = getResultOutputUrl(uid, type, result.application, result.target, result.toolchain);
  const hasDetails = Boolean(
    result.target && result.toolchain && result.worker && result.runtime !== undefined,
  );

  const toggle = () => {
    if (output === null) {
      fetchText(outputPath)
        .then(setOutput)
        .catch(() => setOutput('No output available.'));
    }
    setOpen((value) => !value);
  };

  if (!hasDetails) {
    if (withApplication && result.application) {
      return (
        <div className={results.applicationRow}>
          <span className={results.applicationName}>{result.application}</span>
        </div>
      );
    }
    return null;
  }

  const state = result.status ? 'passed' : 'errored';

  return (
    <div className={results.result}>
      <button
        type="button"
        className={results.resultHead}
        aria-expanded={open}
        title={`${open ? 'Hide' : 'Show'} output`}
        onClick={toggle}
      >
        {withApplication && (
          <span className="row" style={{ gap: 6 }} data-state={state}>
            <span className={controls.stateFg}>
              <Icon name={stateIcon(state)} />
            </span>
            <span className="truncate">{result.application}</span>
          </span>
        )}
        <span className="row" style={{ gap: 6 }}>
          {!withApplication && (
            <span className={controls.stateFg} data-state={state}>
              <Icon name={stateIcon(state)} />
            </span>
          )}
          <Icon name="cpu" />
          <span className="truncate">
            {result.target}:{result.toolchain}
          </span>
        </span>
        <span className="row" style={{ gap: 6 }}>
          <Icon name="wrench" />
          <span className="truncate">{result.worker}</span>
        </span>
        <span className="row" style={{ gap: 6 }}>
          <Icon name="clock" />
          {Number(result.runtime).toFixed(2)}s
        </span>
      </button>

      {open && (
        <div className={results.resultOutput}>
          <a
            className={`${controls.iconBtn} ${results.resultOpen}`}
            href={`${API_BASE}${outputPath}`}
            target="_blank"
            rel="noreferrer noopener"
            title="Open in new tab"
          >
            <Icon name="external" />
          </a>
          <pre>{output ?? 'Loading…'}</pre>
        </div>
      )}
    </div>
  );
}
