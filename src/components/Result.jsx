import { useState } from 'react';
import { API_BASE } from '../api/config';
import { fetchText, getResultOutputUrl } from '../api/murdock';
import { stateIcon } from '../utils/state';
import { Icon } from './Icon';

/** One target/toolchain result, expanding to its raw output. */
export function Result({ uid, type, result, withApplication = false }) {
  const [output, setOutput] = useState(null);
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
        <div className="application-row">
          <span className="application-name">{result.application}</span>
        </div>
      );
    }
    return null;
  }

  const state = result.status ? 'passed' : 'errored';

  return (
    <div className="result">
      <button
        type="button"
        className="result-head"
        aria-expanded={open}
        title={`${open ? 'Hide' : 'Show'} output`}
        onClick={toggle}
      >
        {withApplication && (
          <span className="row" style={{ gap: 6 }} data-state={state}>
            <span className="state-fg">
              <Icon name={stateIcon(state)} />
            </span>
            <span className="truncate">{result.application}</span>
          </span>
        )}
        <span className="row" style={{ gap: 6 }}>
          {!withApplication && (
            <span className="state-fg" data-state={state}>
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
        <div className="result-output">
          <a
            className="icon-btn result-open"
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
