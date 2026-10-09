import { describe, expect, it } from 'vitest';
import {
  ghCheckout,
  gitCheckout,
  jobPullNumber,
  makeCommand,
  reproduceOptions,
} from './reproduce';

describe('jobPullNumber', () => {
  it('prefers the parsed PR info', () => {
    expect(jobPullNumber({ prinfo: { number: 42 } })).toBe(42);
  });

  it('falls back to the CI_PULL_NR env var', () => {
    expect(jobPullNumber({ env: { CI_PULL_NR: '12321' } })).toBe(12321);
  });

  it('returns null when the job has no PR', () => {
    expect(jobPullNumber({})).toBeNull();
    expect(jobPullNumber({ env: {} })).toBeNull();
    expect(jobPullNumber({ env: { CI_PULL_NR: 'not-a-number' } })).toBeNull();
  });
});

describe('makeCommand', () => {
  const result = { application: 'tests/net/foo', target: 'samr21-xpro', toolchain: 'gnu' };

  it('builds with `all`', () => {
    expect(makeCommand(result, 'builds')).toBe(
      'BOARD=samr21-xpro TOOLCHAIN=gnu RIOT_CI_BUILD=1 make -C tests/net/foo all',
    );
  });

  it('builds, flashes and tests on hardware', () => {
    expect(makeCommand(result, 'tests')).toBe(
      'BOARD=samr21-xpro TOOLCHAIN=gnu RIOT_CI_BUILD=1 make -C tests/net/foo all flash test',
    );
  });

  it('uses the same goal on native boards (`flash` is a no-op)', () => {
    expect(makeCommand({ ...result, target: 'native64' }, 'tests')).toBe(
      'BOARD=native64 TOOLCHAIN=gnu RIOT_CI_BUILD=1 make -C tests/net/foo all flash test',
    );
  });
});

describe('ghCheckout', () => {
  it('uses the PR number', () => {
    expect(ghCheckout({ prinfo: { number: 12321 } })).toBe('gh pr checkout 12321');
  });

  it('is null without a PR', () => {
    expect(ghCheckout({})).toBeNull();
  });
});

describe('gitCheckout', () => {
  it('fetches a PR head into a local branch', () => {
    expect(gitCheckout({ env: { CI_PULL_NR: '12321' } })).toBe(
      'git fetch upstream pull/12321/head:pr-12321 && git checkout pr-12321',
    );
  });

  it('handles branches', () => {
    expect(gitCheckout({ ref: 'refs/heads/master' })).toBe(
      'git fetch upstream master && git checkout master',
    );
  });

  it('handles tags', () => {
    expect(gitCheckout({ ref: 'refs/tags/2024.10' })).toBe(
      'git fetch upstream refs/tags/2024.10 && git checkout 2024.10',
    );
  });

  it('handles bare commits', () => {
    expect(gitCheckout({ commit: { sha: 'deadbeef' } })).toBe(
      'git fetch upstream deadbeef && git checkout FETCH_HEAD',
    );
  });

  it('is null without a reference', () => {
    expect(gitCheckout({})).toBeNull();
  });
});

describe('reproduceOptions', () => {
  const result = { application: 'tests/net/foo', target: 'native64', toolchain: 'gnu' };
  const make = 'BOARD=native64 TOOLCHAIN=gnu RIOT_CI_BUILD=1 make -C tests/net/foo all flash test';

  it('offers git, gh and build for a PR, each as a single command', () => {
    const options = reproduceOptions(result, 'tests', { prinfo: { number: 12321 } });
    expect(options.map((option) => option.id)).toEqual(['git', 'gh', 'build']);
    expect(options[0].command).toBe(
      `git fetch upstream pull/12321/head:pr-12321 && git checkout pr-12321 && ${make}`,
    );
    expect(options[1].command).toBe(`gh pr checkout 12321 && ${make}`);
    expect(options[2].command).toBe(make);
    expect(options.every((option) => !option.command.includes('\n'))).toBe(true);
  });

  it('offers git and build without a PR', () => {
    const options = reproduceOptions(result, 'tests', { ref: 'refs/heads/master' });
    expect(options.map((option) => option.id)).toEqual(['git', 'build']);
  });

  it('offers only build without a job', () => {
    const options = reproduceOptions(result, 'builds');
    expect(options.map((option) => option.id)).toEqual(['build']);
    expect(options[0].command).toBe(
      'BOARD=native64 TOOLCHAIN=gnu RIOT_CI_BUILD=1 make -C tests/net/foo all',
    );
  });
});
