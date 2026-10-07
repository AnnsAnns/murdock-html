// Murdock REST endpoints used by the UI.

import { request } from './client';
import type { ApplicationResults, Job } from '../types';

export function getJobs(apiQuery: string, signal?: AbortSignal): Promise<Job[]> {
  return request<Job[]>(`/jobs?${apiQuery}`, { signal });
}

/** `path` is a uid or one of `branch/{x}`, `tag/{x}`, `commit/{sha}`, `pr/{n}`. */
export function getJob(path: string, signal?: AbortSignal): Promise<Job> {
  return request<Job>(`/job/${path}`, { signal });
}

export function deleteJob(uid: string, token?: string): Promise<unknown> {
  return request(`/job/${uid}`, { method: 'DELETE', token });
}

export function restartJob(uid: string, token?: string): Promise<Job> {
  return request<Job>(`/job/${uid}`, { method: 'POST', token });
}

/** Fetch a JSON result file, e.g. `builds.json`, `stats.json`. */
export function getResultFile<T = unknown>(uid: string, file: string, signal?: AbortSignal): Promise<T> {
  return request<T>(`/results/${uid}/${file}`, { signal });
}

export function getApplicationResults(
  uid: string | undefined,
  type: string,
  appPath: string,
  signal?: AbortSignal,
): Promise<ApplicationResults> {
  return request<ApplicationResults>(`/results/${uid}/output/${type}/${appPath}/app.json`, { signal });
}

export function getResultOutputUrl(
  uid: string,
  type: string,
  application: string,
  target: string,
  toolchain: string,
): string {
  return `/results/${uid}/output/${type}/${application}/${target}:${toolchain}.txt`;
}

export function fetchText(url: string, signal?: AbortSignal): Promise<string> {
  return request<string>(url, { signal });
}
