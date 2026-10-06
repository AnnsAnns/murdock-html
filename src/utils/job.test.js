import { describe, expect, it } from 'vitest';
import {
  buildProgress,
  isMergeQueue,
  jobEnd,
  jobStartDate,
  jobTitleUrl,
  refRepr,
} from './job';

const job = (overrides = {}) => ({
  uid: 'abc',
  ref: 'refs/heads/master',
  commit: { sha: 'deadbeef', message: 'core: fix the thing\n\nMore detail', author: 'ann' },
  ...overrides,
});

describe('isMergeQueue', () => {
  it('detects the GitHub merge queue ref', () => {
    expect(isMergeQueue('refs/heads/gh-readonly-queue/master/pr-1')).toBe(true);
    expect(isMergeQueue('refs/heads/master')).toBe(false);
    expect(isMergeQueue(undefined)).toBe(false);
  });
});

describe('refRepr', () => {
  it('renders branch @ subject', () => {
    expect(refRepr(job())).toBe('master @ core: fix the thing');
  });

  it('labels merge-queue jobs', () => {
    expect(refRepr(job({ ref: 'refs/heads/gh-readonly-queue/master/pr-1' }))).toBe(
      'core: fix the thing - Merge Queue',
    );
  });
});

describe('jobTitleUrl', () => {
  it('links to the pull request when present', () => {
    const url = jobTitleUrl(job({ prinfo: { url: 'https://github.com/x/y/pull/1' } }), 'RIOT-OS/RIOT');
    expect(url).toBe('https://github.com/x/y/pull/1');
  });

  it('links to the tree for a branch ref', () => {
    expect(jobTitleUrl(job(), 'RIOT-OS/RIOT')).toBe('https://github.com/RIOT-OS/RIOT/tree/master');
  });
});

describe('buildProgress', () => {
  it('computes done/percent from live counters', () => {
    expect(buildProgress({ total: 10, passed: 3, failed: 1 })).toEqual({
      done: 4,
      total: 10,
      passed: 3,
      failed: 1,
      percent: 40,
    });
  });

  it('returns null when counters are incomplete', () => {
    expect(buildProgress({ passed: 3 })).toBeNull();
    expect(buildProgress(null)).toBeNull();
  });
});

describe('jobStartDate', () => {
  it('prefers start_time', () => {
    expect(jobStartDate({ start_time: 100, creation_time: 50 }).getTime()).toBe(100000);
  });

  it('falls back to creation_time', () => {
    expect(jobStartDate({ creation_time: 50 }).getTime()).toBe(50000);
  });

  it('ignores a zero start_time (queued job)', () => {
    expect(jobStartDate({ start_time: 0, creation_time: 50 }).getTime()).toBe(50000);
    expect(jobStartDate({ start_time: 0, creation_time: 0 })).toBeNull();
  });
});

describe('jobEnd', () => {
  it('is start + runtime for finished jobs', () => {
    const end = jobEnd({ state: 'passed', start_time: 1000, runtime: 60 });
    expect(end).toEqual({ date: new Date(1060000), estimated: false });
  });

  it('estimates a running job from status.eta', () => {
    const now = 5_000_000; // ms
    const end = jobEnd({ state: 'running', start_time: 1000, status: { eta: 30 } }, now);
    expect(end).toEqual({ date: new Date((5000 + 30) * 1000), estimated: true });
  });

  it('returns null when there is nothing to derive an end from', () => {
    expect(jobEnd({ state: 'running', status: {} })).toBeNull();
    expect(jobEnd({ state: 'queued', creation_time: 1, runtime: 0 })).toBeNull();
    expect(jobEnd({ state: 'passed', start_time: 0, runtime: 0 })).toBeNull();
  });
});
