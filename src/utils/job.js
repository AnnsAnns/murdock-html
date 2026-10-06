// Derives display strings from a Murdock JobModel.

export function isMergeQueue(ref) {
  return Boolean(
    ref &&
      ref.startsWith('refs/') &&
      ref.split('/').slice(2, 3).join('/') === 'gh-readonly-queue',
  );
}

/** Human representation of a job's ref (branch/tag/merge-queue). */
export function refRepr(job) {
  const ref = job.ref;
  const firstLine = job.commit?.message?.split('\n')[0] ?? '';
  if (ref && ref.startsWith('refs/')) {
    if (isMergeQueue(ref)) return `${firstLine} - Merge Queue`;
    return `${ref.split('/').slice(2).join('/')} @ ${firstLine}`;
  }
  return (ref ?? '').substring(0, 15);
}

/** "(PR #12)" or "(branch @ subject)" used in notifications. */
export function jobContext(job) {
  if (job.prinfo) return `(PR #${job.prinfo.number})`;
  return `(${refRepr(job)})`;
}

export function jobTitle(job) {
  return job.prinfo ? job.prinfo.title : refRepr(job);
}

/** GitHub URL the title links to. */
export function jobTitleUrl(job, repo) {
  if (job.prinfo) return job.prinfo.url;
  if (isMergeQueue(job.ref)) {
    const target = job.ref.split('/').slice(3, 4)[0];
    return `https://github.com/${repo}/queue/${target}`;
  }
  if (job.ref && job.ref.startsWith('refs/')) {
    return `https://github.com/${repo}/tree/${job.ref.split('/')[2]}`;
  }
  return `https://github.com/${repo}/commit/${job.commit.sha}`;
}

/** State name used to colour the GitHub mark, or null for neutral. */
export function prStateColor(prinfo) {
  if (!prinfo) return null;
  if (prinfo.is_merged) return 'queued';
  if (prinfo.state === 'closed') return 'errored';
  if (prinfo.state === 'open') return 'passed';
  return null;
}

/** Live build progress, or null when the counters are not yet meaningful. */
export function buildProgress(status) {
  if (!status) return null;
  const has = (key) => Object.prototype.hasOwnProperty.call(status, key);
  if (!has('total') || !has('passed') || !has('failed')) return null;
  if (status.total < status.passed + status.failed) return null;
  const done = status.passed + status.failed;
  const percent = status.total ? Math.round((done * 100) / status.total) : 0;
  return { done, total: status.total, passed: status.passed, failed: status.failed, percent };
}

/** Tooltip text for a job row. */
export function jobTooltip(job) {
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
export function jobRefLink(job, repo) {
  if (job.prinfo?.url) {
    return {
      url: job.prinfo.url,
      label: `PR #${job.prinfo.number}`,
      title: job.prinfo.title ?? `Pull request #${job.prinfo.number}`,
      icon: 'gitPullRequest',
    };
  }

  const pullNr = job.env?.CI_PULL_NR;
  if (pullNr) {
    return {
      url: `https://github.com/${repo}/pull/${pullNr}`,
      label: `PR #${pullNr}`,
      title: `Pull request #${pullNr}`,
      icon: 'gitPullRequest',
    };
  }

  if (isMergeQueue(job.ref)) {
    const branch = job.ref.split('/').slice(3, 4)[0];
    return {
      url: `https://github.com/${repo}/queue/${branch}`,
      label: 'Merge queue',
      title: `Merge queue for ${branch}`,
      icon: 'gitMerge',
    };
  }

  if (job.ref?.startsWith('refs/heads/')) {
    const branch = job.ref.slice('refs/heads/'.length);
    return {
      url: `https://github.com/${repo}/tree/${branch}`,
      label: branch,
      title: `Branch ${branch}`,
      icon: 'gitBranch',
    };
  }

  if (job.ref?.startsWith('refs/tags/')) {
    const tag = job.ref.slice('refs/tags/'.length);
    return {
      url: `https://github.com/${repo}/tree/${tag}`,
      label: tag,
      title: `Tag ${tag}`,
      icon: 'tag',
    };
  }

  if (job.commit?.sha) {
    return {
      url: `https://github.com/${repo}/commit/${job.commit.sha}`,
      label: 'commit',
      title: `Commit ${job.commit.sha}`,
      icon: 'gitCommit',
    };
  }

  return null;
}

/** When a job started. A zero/absent `start_time` means it never started. */
export function jobStartDate(job) {
  const seconds = [job.start_time, job.creation_time].find((value) => value > 0);
  return seconds != null ? new Date(seconds * 1000) : null;
}

/**
 * When a job ended. For a running job this is an estimate derived from
 * `status.eta` (seconds remaining), so it is marked as estimated. Queued jobs
 * have not ended.
 */
export function jobEnd(job, now = Date.now()) {
  if (job.state === 'running') {
    const eta = job.status?.eta;
    if (eta == null) return null;
    return { date: new Date((now / 1000 + eta) * 1000), estimated: true };
  }

  if (job.state === 'queued') return null;

  if (job.start_time > 0 && job.runtime != null) {
    return { date: new Date((job.start_time + job.runtime) * 1000), estimated: false };
  }

  return null;
}
