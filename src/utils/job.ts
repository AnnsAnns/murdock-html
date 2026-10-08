// Derives display strings from a Murdock JobModel.

import type {
  BuildProgress,
  Job,
  JobEnd,
  JobRefSource,
  JobState,
  JobStatus,
  PrInfo,
  QueueJob,
  RefLink,
  TimelineSegment,
} from '../types';
import { FINISHED_STATES } from './state';

export function isMergeQueue(ref: string | undefined): boolean {
  return Boolean(
    ref &&
      ref.startsWith('refs/') &&
      ref.split('/').slice(2, 3).join('/') === 'gh-readonly-queue',
  );
}

/** A scheduled nightly run, flagged by the CI via the NIGHTLY env var. */
export function isNightly(env: Record<string, string> | undefined): boolean {
  return env?.NIGHTLY === '1';
}

/** Labels attached to a job, from PR info or the CI_PULL_LABELS env. */
export function jobLabels(job: Pick<Job, 'prinfo' | 'env'>): string[] {
  if (job.prinfo?.labels?.length) return job.prinfo.labels;
  const raw = job.env?.CI_PULL_LABELS;
  return raw ? raw.split(';').filter(Boolean) : [];
}

/** Case-insensitive match of a term against a job's message, PR title or ref. */
export function jobMatchesSearch(
  job: Pick<Job, 'commit' | 'prinfo' | 'ref'>,
  term: string,
): boolean {
  const needle = term.trim().toLowerCase();
  if (!needle) return true;
  const haystack = [job.commit?.message, job.prinfo?.title, job.ref]
    .filter((value): value is string => Boolean(value))
    .join('\n')
    .toLowerCase();
  return haystack.includes(needle);
}

/** Human representation of a job's ref (branch/tag/merge-queue). */
export function refRepr(job: Pick<Job, 'ref' | 'commit'>): string {
  const ref = job.ref;
  const firstLine = job.commit?.message?.split('\n')[0] ?? '';
  if (ref && ref.startsWith('refs/')) {
    if (isMergeQueue(ref)) return `${firstLine} - Merge Queue`;
    return `${ref.split('/').slice(2).join('/')} @ ${firstLine}`;
  }
  return (ref ?? '').substring(0, 15);
}

/** "(PR #12)" or "(branch @ subject)" used in notifications. */
export function jobContext(job: Pick<Job, 'prinfo' | 'ref' | 'commit'>): string {
  if (job.prinfo) return `(PR #${job.prinfo.number})`;
  return `(${refRepr(job)})`;
}

export function jobTitle(job: Pick<Job, 'prinfo' | 'ref' | 'commit'>): string {
  return job.prinfo ? job.prinfo.title ?? '' : refRepr(job);
}

/** GitHub URL the title links to. */
export function jobTitleUrl(job: Pick<Job, 'prinfo' | 'ref' | 'commit'>, repo: string): string {
  if (job.prinfo) return job.prinfo.url ?? `https://github.com/${repo}`;
  if (isMergeQueue(job.ref)) {
    const target = job.ref?.split('/').slice(3, 4)[0];
    return `https://github.com/${repo}/queue/${target}`;
  }
  if (job.ref && job.ref.startsWith('refs/')) {
    return `https://github.com/${repo}/tree/${job.ref.split('/')[2]}`;
  }
  return `https://github.com/${repo}/commit/${job.commit.sha}`;
}

/** State name used to colour the GitHub mark, or null for neutral. */
export function prStateColor(prinfo: PrInfo | null | undefined): string | null {
  if (!prinfo) return null;
  if (prinfo.is_merged) return 'queued';
  if (prinfo.state === 'closed') return 'errored';
  if (prinfo.state === 'open') return 'passed';
  return null;
}

/** Live build progress, or null when the counters are not yet meaningful. */
export function buildProgress(status: JobStatus | null | undefined): BuildProgress | null {
  if (!status) return null;
  const has = (key: keyof JobStatus) => Object.prototype.hasOwnProperty.call(status, key);
  if (!has('total') || !has('passed') || !has('failed')) return null;
  const total = status.total ?? 0;
  const passed = status.passed ?? 0;
  const failed = status.failed ?? 0;
  if (total < passed + failed) return null;
  const done = passed + failed;
  const percent = total ? Math.round((done * 100) / total) : 0;
  return { done, total, passed, failed, percent };
}

/** Tooltip text for a job row. */
export function jobTooltip(job: Pick<Job, 'commit' | 'prinfo'>): string {
  let text = `Commit: ${job.commit.sha}\n\n${job.commit.message}\n\nAuthor: ${job.commit.author}`;
  if (job.prinfo?.is_merged) text += '\n\nState: merged';
  else if (job.prinfo?.state) text += `\n\nState: ${job.prinfo.state}`;
  if (job.prinfo?.labels?.length) text += `\n\nLabels: "${job.prinfo.labels.join('", "')}"`;
  return text;
}

/**
 * The external reference a job belongs to, with a human label for the link:
 * its pull request, the merge queue, or the branch/tag/commit it was built
 * from. Data comes from the job payload itself (no extra requests).
 */
export function jobRefLink(
  job: JobRefSource,
  repo: string,
): RefLink | null {
  if (job.prinfo?.url) {
    return {
      url: job.prinfo.url,
      label: `PR #${job.prinfo.number}`,
      title: job.prinfo.title ?? `Pull request #${job.prinfo.number}`,
      icon: 'gitPullRequest',
      kind: 'pr',
    };
  }

  const pullNr = job.env?.CI_PULL_NR;
  if (pullNr) {
    return {
      url: `https://github.com/${repo}/pull/${pullNr}`,
      label: `PR #${pullNr}`,
      title: `Pull request #${pullNr}`,
      icon: 'gitPullRequest',
      kind: 'pr',
    };
  }

  if (isMergeQueue(job.ref)) {
    const branch = job.ref?.split('/').slice(3, 4)[0];
    return {
      url: `https://github.com/${repo}/queue/${branch}`,
      label: 'Merge queue',
      title: `Merge queue for ${branch}`,
      icon: 'gitMerge',
      kind: 'merge-queue',
    };
  }

  if (job.ref?.startsWith('refs/heads/')) {
    const branch = job.ref.slice('refs/heads/'.length);
    return {
      url: `https://github.com/${repo}/tree/${branch}`,
      label: branch,
      title: `Branch ${branch}`,
      icon: 'gitBranch',
      kind: 'branch',
    };
  }

  if (job.ref?.startsWith('refs/tags/')) {
    const tag = job.ref.slice('refs/tags/'.length);
    return {
      url: `https://github.com/${repo}/tree/${tag}`,
      label: tag,
      title: `Tag ${tag}`,
      icon: 'tag',
      kind: 'tag',
    };
  }

  if (job.commit?.sha) {
    return {
      url: `https://github.com/${repo}/commit/${job.commit.sha}`,
      label: 'commit',
      title: `Commit ${job.commit.sha}`,
      icon: 'gitCommit',
      kind: 'commit',
    };
  }

  return null;
}

/** When a job started. A zero/absent `start_time` means it never started. */
export function jobStartDate(job: Pick<Job, 'start_time' | 'creation_time'>): Date | null {
  const seconds = [job.start_time, job.creation_time].find((value) => value != null && value > 0);
  return seconds != null ? new Date(seconds * 1000) : null;
}

/**
 * When a job ended. For a running job this is an estimate derived from
 * `status.eta` (seconds remaining), so it is marked as estimated. Queued jobs
 * have not ended.
 */
export function jobEnd(
  job: Pick<Job, 'state' | 'start_time' | 'runtime' | 'status'>,
  now: number = Date.now(),
): JobEnd | null {
  if (job.state === 'running') {
    const eta = job.status?.eta;
    if (eta == null) return null;
    return { date: new Date((now / 1000 + eta) * 1000), estimated: true };
  }

  if (job.state === 'queued') return null;

  const { start_time: startTime, runtime } = job;
  if (startTime != null && startTime > 0 && runtime != null) {
    return { date: new Date((startTime + runtime) * 1000), estimated: false };
  }

  return null;
}

// Typical Murdock runtimes in seconds, used to estimate when queued jobs start.
// The CI flags in `env` tell the job classes apart: a "skip compile test" run
// is only a few minutes, a regular build ~15 min, and a full build (or a
// merge-queue run, which builds everything) ~2 h.
const SKIP_COMPILE_TEST_RUNTIME = 3 * 60;
const NORMAL_RUNTIME = 15 * 60;
const FULL_BUILD_RUNTIME = 2 * 60 * 60;

/**
 * Estimated total runtime (seconds) of a job, inferred from the CI flags
 * Murdock records in `env` and the job's ref.
 */
export function estimatedRuntime(job: Pick<Job, 'env' | 'ref'>): number {
  const labels = job.env?.CI_PULL_LABELS ?? '';
  if (labels.includes('CI: skip compile test')) return SKIP_COMPILE_TEST_RUNTIME;
  if (labels.includes('CI: full build')) return FULL_BUILD_RUNTIME;
  const ref = job.ref ?? job.env?.CI_BUILD_REF ?? '';
  if (isMergeQueue(ref)) return FULL_BUILD_RUNTIME;
  return NORMAL_RUNTIME;
}

/** Remaining runtime (seconds): the live `status.eta` while running, else the estimate. */
function remainingRuntime(job: QueueJob, now: number): number {
  if (job.state === 'running') {
    const eta = job.status?.eta;
    if (eta != null) return Math.max(0, eta);
    const start = jobStartDate(job);
    if (start) return Math.max(0, estimatedRuntime(job) - (now - start.getTime()) / 1000);
  }
  return estimatedRuntime(job);
}

/**
 * Estimated start time (ms since epoch) for every queued job, assuming the
 * queue is worked through in order. Each job ahead contributes its remaining
 * runtime: a running job its live `status.eta`, a queued one its estimated
 * runtime derived from the CI flags. Returns a Map keyed by uid.
 */
export function estimateQueuedStarts(jobs: QueueJob[], now: number = Date.now()): Map<string, number> {
  const starts = new Map<string, number>();
  const ordered = [...jobs].sort((a, b) => (a.creation_time ?? 0) - (b.creation_time ?? 0));

  let cursor = now;
  for (const job of ordered) {
    if (job.state === 'running') {
      cursor += remainingRuntime(job, now) * 1000;
    } else if (job.state === 'queued') {
      starts.set(job.uid, cursor);
      cursor += remainingRuntime(job, now) * 1000;
    }
  }

  return starts;
}

interface Interval {
  uid: string;
  state: JobState;
  future: boolean;
  start: number;
  end: number;
}

/**
 * Builds a chronological timeline of the loaded jobs for the active-time bar,
 * oldest first. Finished jobs contribute their runtime and a running job its
 * elapsed time; the running ETA and the queued jobs' estimated runtimes form
 * the future. Gaps between jobs become explicit idle segments, so the bar
 * covers wall-clock time without holes.
 *
 * Each segment is `{ start, end, seconds, idle, future, uid?, state? }` with
 * `start`/`end` in milliseconds and `seconds` as the duration.
 */
export function activeTimeTimeline(jobs: QueueJob[], now: number = Date.now()): TimelineSegment[] {
  const queuedStarts = estimateQueuedStarts(jobs, now);
  const intervals: Interval[] = [];

  for (const job of jobs) {
    if (job.state === 'queued') {
      const start = queuedStarts.get(job.uid);
      if (start == null) continue;
      intervals.push({
        uid: job.uid,
        state: job.state,
        future: true,
        start,
        end: start + estimatedRuntime(job) * 1000,
      });
    } else if (job.state === 'running') {
      const start = jobStartDate(job);
      if (start && now > start.getTime()) {
        intervals.push({
          uid: job.uid,
          state: job.state,
          future: false,
          start: start.getTime(),
          end: now,
        });
      }
      const eta = job.status?.eta;
      if (eta != null && eta > 0) {
        intervals.push({
          uid: job.uid,
          state: job.state,
          future: true,
          start: now,
          end: now + eta * 1000,
        });
      }
    } else if (FINISHED_STATES.includes(job.state) && (job.runtime ?? 0) > 0) {
      const start = jobStartDate(job);
      const runtime = job.runtime ?? 0;
      if (start) {
        intervals.push({
          uid: job.uid,
          state: job.state,
          future: false,
          start: start.getTime(),
          end: start.getTime() + runtime * 1000,
        });
      }
    }
  }

  if (!intervals.length) return [];

  intervals.sort((a, b) => a.start - b.start);

  const segments: Omit<TimelineSegment, 'seconds'>[] = [];
  let cursor = intervals[0].start;
  for (const interval of intervals) {
    const start = Math.max(interval.start, cursor);
    if (start > cursor) {
      segments.push({ idle: true, future: false, start: cursor, end: start });
    }
    if (interval.end > start) {
      segments.push({ ...interval, start, end: interval.end });
      cursor = interval.end;
    }
  }

  return segments.map((segment) => ({ ...segment, seconds: (segment.end - segment.start) / 1000 }));
}
