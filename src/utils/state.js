// Job state vocabulary shared across the UI.

export const STATES = ['queued', 'running', 'passed', 'errored', 'stopped'];

export const STATE_LABELS = {
  errored: 'Failed',
  passed: 'Success',
  queued: 'Queued',
  running: 'Running',
  stopped: 'Stopped',
};

export const STATE_ICONS = {
  errored: 'cross',
  passed: 'check',
  queued: 'inbox',
  running: 'gear',
  stopped: 'dash',
};

export const FINISHED_STATES = ['passed', 'errored', 'stopped'];

export function stateLabel(state) {
  return STATE_LABELS[state] ?? state;
}

export function stateIcon(state) {
  return STATE_ICONS[state] ?? 'inbox';
}
