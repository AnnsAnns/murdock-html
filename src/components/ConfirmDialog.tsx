import { useId } from 'react';
import styles from './ConfirmDialog.module.css';
import controls from '../styles/controls.module.css';
import { Dialog } from './Dialog';

interface ConfirmDialogProps {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

/** Small modal confirmation, dismissed with Escape or a backdrop click. */
export function ConfirmDialog({
  title,
  message,
  confirmLabel = 'Yes',
  cancelLabel = 'Cancel',
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const titleId = useId();

  return (
    <Dialog role="alertdialog" labelledBy={titleId} onClose={onCancel} className={styles.dialog}>
      <h2 id={titleId} className={styles.title}>
        {title}
      </h2>
      <p className={styles.message}>{message}</p>
      <div className={styles.actions}>
        <button
          type="button"
          className={`${controls.btn} ${controls.btnGhost}`}
          onClick={onCancel}
        >
          {cancelLabel}
        </button>
        <button type="button" className={controls.btn} onClick={onConfirm}>
          {confirmLabel}
        </button>
      </div>
    </Dialog>
  );
}
