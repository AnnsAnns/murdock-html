// Murdock REST endpoints used by the UI.

import { request } from './client';

export function getJobs(apiQuery, signal) {
  return request(`/jobs?${apiQuery}`, { signal });
}

/** `path` is a uid or one of `branch/{x}`, `tag/{x}`, `commit/{sha}`, `pr/{n}`. */
export function getJob(path, signal) {
  return request(`/job/${path}`, { signal });
}

export function deleteJob(uid, token) {
  return request(`/job/${uid}`, { method: 'DELETE', token });
}

export function restartJob(uid, token) {
  return request(`/job/${uid}`, { method: 'POST', token });
}

/** Fetch a JSON result file, e.g. `builds.json`, `stats.json`. */
export function getResultFile(uid, file, signal) {
  return request(`/results/${uid}/${file}`, { signal });
}

export function getApplicationResults(uid, type, appPath, signal) {
  return request(`/results/${uid}/output/${type}/${appPath}/app.json`, { signal });
}

export function getResultOutputUrl(uid, type, application, target, toolchain) {
  return `/results/${uid}/output/${type}/${application}/${target}:${toolchain}.txt`;
}

export function fetchText(url, signal) {
  return request(url, { signal });
}
