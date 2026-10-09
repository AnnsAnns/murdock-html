// Builds the shell recipes that reproduce a Murdock result on a local checkout.

import type { Job, JobRefSource, ResultItem } from '../types';

/** The pull request number a job belongs to, if any. */
export function jobPullNumber(job: Pick<Job, 'prinfo' | 'env'>): number | null {
  if (typeof job.prinfo?.number === 'number') return job.prinfo.number;
  const raw = job.env?.CI_PULL_NR;
  const parsed = raw != null ? Number.parseInt(raw, 10) : Number.NaN;
  return Number.isFinite(parsed) ? parsed : null;
}

/** Native boards run tests without flashing; everything else is flashed first. */
function isNative(target: string): boolean {
  return target.startsWith('native');
}

/** How the code is checked out before the build. */
export type CheckoutMethod = 'gh' | 'git' | 'build';

export interface ReproOption {
  id: CheckoutMethod;
  /** Human label, e.g. "gh CLI". */
  label: string;
  /** The exact text the Copy button puts on the clipboard. */
  command: string;
}

/**
 * The `make` invocation that builds (or flashes and tests) one result. It
 * mirrors RIOT's `.murdock`: environment variables first, then `make` in the
 * application folder, with `RIOT_CI_BUILD=1` as CI exports it. A build runs
 * `all`; a test flashes and runs the app, except on native boards, which only
 * need `test`.
 */
export function makeCommand(
  result: Pick<ResultItem, 'application' | 'target' | 'toolchain'>,
  kind: string,
): string {
  const goal = kind === 'tests' ? (isNative(result.target) ? 'test' : 'flash test') : 'all';
  return `BOARD=${result.target} TOOLCHAIN=${result.toolchain} RIOT_CI_BUILD=1 make -C ${result.application} ${goal}`;
}

/** The `gh` CLI checkout, or null when the job is not a pull request. */
export function ghCheckout(job: JobRefSource): string | null {
  const pr = jobPullNumber(job);
  return pr != null ? `gh pr checkout ${pr}` : null;
}

/**
 * A plain `git` checkout that needs no GitHub CLI: pull requests come from
 * GitHub's `refs/pull/<n>/head`, branches, tags and commits from the `upstream`
 * remote (RIOT's convention: `origin` is your fork). Returns null when the job
 * has no usable reference.
 */
export function gitCheckout(job: JobRefSource): string | null {
  const pr = jobPullNumber(job);
  if (pr != null) {
    return `git fetch upstream pull/${pr}/head:pr-${pr} && git checkout pr-${pr}`;
  }

  const ref = job.ref;
  if (ref?.startsWith('refs/heads/')) {
    const branch = ref.slice('refs/heads/'.length);
    return `git fetch upstream ${branch} && git checkout ${branch}`;
  }
  if (ref?.startsWith('refs/tags/')) {
    const tag = ref.slice('refs/tags/'.length);
    return `git fetch upstream refs/tags/${tag} && git checkout ${tag}`;
  }
  if (job.commit?.sha) {
    return `git fetch upstream ${job.commit.sha} && git checkout FETCH_HEAD`;
  }
  return null;
}

/**
 * The copy recipes offered in the reproduce dialog: a plain `git` checkout
 * (the default, no GitHub account needed), a `gh` CLI checkout (both omitted
 * when the job has no reference), and the build on its own. Each recipe is a
 * single shell command (checkout and build joined with `&&`) so it can be
 * pasted straight into a terminal. The first entry is the suggested default.
 */
export function reproduceOptions(
  result: Pick<ResultItem, 'application' | 'target' | 'toolchain'>,
  kind: string,
  job?: JobRefSource | null,
): ReproOption[] {
  const source = job ?? {};
  const make = makeCommand(result, kind);
  const options: ReproOption[] = [];

  const git = gitCheckout(source);
  if (git) options.push({ id: 'git', label: 'git checkout', command: `${git} && ${make}` });

  const gh = ghCheckout(source);
  if (gh) options.push({ id: 'gh', label: 'gh CLI', command: `${gh} && ${make}` });

  options.push({ id: 'build', label: 'Build only', command: make });
  return options;
}
