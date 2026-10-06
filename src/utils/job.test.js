import { describe, expect, it } from 'vitest';
import { buildProgress, isMergeQueue, jobTitleUrl, refRepr } from './job';

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
