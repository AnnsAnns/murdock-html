// Job state vocabulary shared across the UI.

import type { IconName, JobState } from '../types';

export const STATES: readonly JobState[] = ['queued', 'running', 'passed', 'errored', 'stopped'];

export const STATE_LABELS: Record<string, string> = {
  errored: 'Failed',
  passed: 'Success',
  queued: 'Queued',
  running: 'Running',
  stopped: 'Stopped',
};

export const STATE_ICONS: Record<string, IconName> = {
  errored: 'cross',
  passed: 'check',
  queued: 'inbox',
  running: 'gear',
  stopped: 'dash',
};

export const FINISHED_STATES: readonly JobState[] = ['passed', 'errored', 'stopped'];

export function stateLabel(state: string): string {
  return STATE_LABELS[state] ?? state;
}

export function stateIcon(state: string): IconName {
  return STATE_ICONS[state] ?? 'inbox';
}
