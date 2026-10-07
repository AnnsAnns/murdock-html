import { describe, expect, it } from 'vitest';
import {
  activeTimeTimeline,
  buildProgress,
  estimateQueuedStarts,
  estimatedRuntime,
  isMergeQueue,
  jobEnd,
  jobRefLink,
  jobStartDate,
  jobTitleUrl,
  refRepr,
} from './job';
import type { Job, QueueJob } from '../types';

const job = (overrides: Partial<Job> = {}): Job => ({
  uid: 'abc',
  state: 'passed',
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
    const url = jobTitleUrl(
      job({ prinfo: { number: 1, url: 'https://github.com/x/y/pull/1' } }),
      'RIOT-OS/RIOT',
    );
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
    expect(jobStartDate({ start_time: 100, creation_time: 50 })?.getTime()).toBe(100000);
  });

  it('falls back to creation_time', () => {
    expect(jobStartDate({ creation_time: 50 })?.getTime()).toBe(50000);
  });

  it('ignores a zero start_time (queued job)', () => {
    expect(jobStartDate({ start_time: 0, creation_time: 50 })?.getTime()).toBe(50000);
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
    expect(jobEnd({ state: 'queued', runtime: 0 })).toBeNull();
    expect(jobEnd({ state: 'passed', start_time: 0, runtime: 0 })).toBeNull();
  });
});

describe('estimatedRuntime', () => {
  it('is short for skip-compile-test jobs', () => {
    expect(estimatedRuntime({ env: { CI_PULL_LABELS: 'CI: ready for build;CI: skip compile test' } })).toBe(
      180,
    );
  });

  it('is long for full builds', () => {
    expect(estimatedRuntime({ env: { CI_PULL_LABELS: 'CI: full build' } })).toBe(7200);
  });

  it('is long for merge-queue jobs', () => {
    expect(estimatedRuntime({ ref: 'refs/heads/gh-readonly-queue/master/pr-1' })).toBe(7200);
    expect(
      estimatedRuntime({ env: { CI_BUILD_REF: 'refs/heads/gh-readonly-queue/master/pr-1' } }),
    ).toBe(7200);
  });

  it('defaults to a normal build', () => {
    expect(estimatedRuntime({ env: { CI_PULL_LABELS: 'CI: ready for build' } })).toBe(900);
  });
});

describe('estimateQueuedStarts', () => {
  const now = 1_000_000_000_000; // ms

  it('starts the first queued job when the running job finishes', () => {
    const running: QueueJob = { uid: 'r', state: 'running', creation_time: 1, status: { eta: 60 } };
    const queued: QueueJob = { uid: 'q', state: 'queued', creation_time: 2 };
    const starts = estimateQueuedStarts([queued, running], now);
    expect(starts.get('q')).toBe(now + 60 * 1000);
  });

  it('sums the estimated runtimes of the jobs ahead in the queue', () => {
    const running: QueueJob = { uid: 'r', state: 'running', creation_time: 1, status: { eta: 30 } };
    const skip: QueueJob = {
      uid: 'a',
      state: 'queued',
      creation_time: 2,
      env: { CI_PULL_LABELS: 'CI: skip compile test' },
    };
    const full: QueueJob = {
      uid: 'b',
      state: 'queued',
      creation_time: 3,
      ref: 'refs/heads/gh-readonly-queue/master/pr-1',
    };
    const starts = estimateQueuedStarts([full, skip, running], now);
    expect(starts.get('a')).toBe(now + 30 * 1000);
    expect(starts.get('b')).toBe(now + (30 + 180) * 1000);
  });

  it('falls back to the estimated runtime when a running job has no ETA', () => {
    const startedAt = now / 1000 - 60;
    const running: QueueJob = { uid: 'r', state: 'running', creation_time: 1, start_time: startedAt };
    const queued: QueueJob = { uid: 'q', state: 'queued', creation_time: 2 };
    const starts = estimateQueuedStarts([running, queued], now);
    expect(starts.get('q')).toBe(now + (900 - 60) * 1000);
  });

  it('ignores jobs that are neither running nor queued', () => {
    const starts = estimateQueuedStarts([{ uid: 'p', state: 'passed', creation_time: 1 }], now);
    expect(starts.size).toBe(0);
  });
});

describe('activeTimeTimeline', () => {
  const now = 1_000_000; // ms

  it('orders jobs and fills idle gaps', () => {
    const segments = activeTimeTimeline(
      [
        { uid: 'b', state: 'errored', start_time: 900, runtime: 100 },
        { uid: 'a', state: 'passed', start_time: 800, runtime: 60 },
      ],
      now,
    );

    expect(segments.map((seg) => (seg.idle ? 'idle' : seg.uid))).toEqual(['a', 'idle', 'b']);
    expect(segments[1].seconds).toBe(40);
    expect(segments[1].future).toBe(false);
  });

  it('splits a running job into elapsed and expected parts', () => {
    const segments = activeTimeTimeline(
      [
        {
          uid: 'r',
          state: 'running',
          start_time: now / 1000 - 100,
          status: { eta: 50 },
        },
      ],
      now,
    );

    expect(segments).toHaveLength(2);
    expect(segments[0]).toMatchObject({ uid: 'r', future: false, seconds: 100 });
    expect(segments[1]).toMatchObject({ uid: 'r', future: true, seconds: 50 });
  });

  it('appends queued jobs as the future', () => {
    const segments = activeTimeTimeline(
      [{ uid: 'q', state: 'queued', env: { CI_PULL_LABELS: 'CI: skip compile test' } }],
      now,
    );

    expect(segments).toHaveLength(1);
    expect(segments[0]).toMatchObject({ uid: 'q', state: 'queued', future: true, seconds: 180 });
  });
});

describe('jobRefLink', () => {
  it('links a PR job to its pull request', () => {
    const link = jobRefLink(
      { prinfo: { number: 1, url: 'https://github.com/x/y/pull/1', title: 'Fix it' } },
      'RIOT-OS/RIOT',
    );
    expect(link).toEqual({
      url: 'https://github.com/x/y/pull/1',
      label: 'PR #1',
      title: 'Fix it',
      icon: 'gitPullRequest',
    });
  });

  it('falls back to env.CI_PULL_NR', () => {
    const link = jobRefLink({ env: { CI_PULL_NR: '42' } }, 'RIOT-OS/RIOT');
    expect(link?.url).toBe('https://github.com/RIOT-OS/RIOT/pull/42');
    expect(link?.label).toBe('PR #42');
    expect(link?.icon).toBe('gitPullRequest');
  });

  it('links merge-queue jobs to the merge queue', () => {
    const link = jobRefLink({ ref: 'refs/heads/gh-readonly-queue/master/pr-1' }, 'RIOT-OS/RIOT');
    expect(link?.url).toBe('https://github.com/RIOT-OS/RIOT/queue/master');
    expect(link?.label).toBe('Merge queue');
    expect(link?.icon).toBe('gitMerge');
  });

  it('links branch and tag refs', () => {
    expect(jobRefLink({ ref: 'refs/heads/master' }, 'R/R')).toMatchObject({
      url: 'https://github.com/R/R/tree/master',
      icon: 'gitBranch',
    });
    expect(jobRefLink({ ref: 'refs/tags/v1' }, 'R/R')).toMatchObject({ label: 'v1', icon: 'tag' });
  });

  it('falls back to the commit', () => {
    const link = jobRefLink({ commit: { sha: 'abc123' } }, 'R/R');
    expect(link?.url).toBe('https://github.com/R/R/commit/abc123');
    expect(link?.label).toBe('commit');
    expect(link?.icon).toBe('gitCommit');
  });
});
