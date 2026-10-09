import { useId, useState } from 'react';
import controls from '../styles/controls.module.css';
import styles from './ReproduceDialog.module.css';
import { copyText } from '../utils/clipboard';
import { reproduceOptions, type CheckoutMethod } from '../utils/reproduce';
import { Dialog } from './Dialog';
import { Icon } from './Icon';
import { useToast } from './Toast';
import type { JobRefSource, ResultItem } from '../types';

export interface ReproduceDialogProps {
  result: ResultItem;
  /** `builds` or `tests`; decides which `make` goal is suggested. */
  kind: string;
  /** Job the result belongs to; drives the checkout recipes. */
  job?: JobRefSource | null;
  onClose: () => void;
}

/**
 * Modal that shows the local commands reproducing one result. A segmented
 * picker chooses how the code is checked out (`gh`, plain `git`, or build
 * only); the preview and the Copy button always reflect that choice.
 */
export function ReproduceDialog({ result, kind, job, onClose }: ReproduceDialogProps) {
  const { notify } = useToast();
  const [method, setMethod] = useState<CheckoutMethod | null>(null);
  const [copied, setCopied] = useState(false);
  const titleId = useId();

  const options = reproduceOptions(result, kind, job);
  // Fall back to the first option when the chosen one disappears (e.g. the job
  // resolves to a non-PR reference after mount).
  const selected = options.find((option) => option.id === method) ?? options[0];

  const select = (id: CheckoutMethod) => {
    setMethod(id);
    setCopied(false);
  };

  const copy = async () => {
    if (await copyText(selected.command)) {
      setCopied(true);
      notify('Copied to clipboard');
      window.setTimeout(() => setCopied(false), 2000);
    } else {
      notify('Could not copy to clipboard', 'danger');
    }
  };

  return (
    <Dialog labelledBy={titleId} onClose={onClose} className={styles.dialog}>
      <div className={styles.header}>
        <span className={styles.title} id={titleId}>
          <Icon name="copy" />
          Reproduce this result
        </span>
        <button
          type="button"
          className={controls.iconBtn}
          aria-label="Close"
          title="Close"
          onClick={onClose}
        >
          <Icon name="close" />
        </button>
      </div>

      <dl className={styles.facts}>
        <div>
          <dt>Folder</dt>
          <dd>{result.application}</dd>
        </div>
        <div>
          <dt>Board</dt>
          <dd>{result.target}</dd>
        </div>
        <div>
          <dt>Toolchain</dt>
          <dd>{result.toolchain}</dd>
        </div>
      </dl>

      <div className={styles.methods} role="group" aria-label="Checkout method">
        {options.map((option) => (
          <button
            key={option.id}
            type="button"
            className={`${styles.method}${option.id === selected.id ? ` ${styles.isActive}` : ''}`}
            aria-pressed={option.id === selected.id}
            onClick={() => select(option.id)}
          >
            {option.label}
          </button>
        ))}
      </div>

      <pre className={styles.command}>{selected.command}</pre>

      <div className={styles.actions}>
        <button
          type="button"
          className={`${controls.btn} ${controls.btnSm} ${controls.btnGhost}`}
          onClick={onClose}
        >
          Close
        </button>
        <button type="button" className={`${controls.btn} ${controls.btnSm}`} onClick={copy}>
          <Icon name={copied ? 'check' : 'copy'} />
          <span>{copied ? 'Copied!' : `Copy ${selected.label}`}</span>
        </button>
      </div>
    </Dialog>
  );
}
