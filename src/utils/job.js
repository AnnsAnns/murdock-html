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
