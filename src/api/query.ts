// Job-list query <-> API/URL serialisation.
// `states` and `prstates` are space-joined; the API receives them `+`-joined
// (URLSearchParams encodes a space as `+`, which the server splits back).

import { ITEMS_DISPLAYED_STEP } from './config';
import { STATES } from '../utils/state';
import type { JobState, JobType, QueryParams } from '../types';

export const JOB_TYPES: readonly JobType[] = ['all', 'pr', 'branch', 'merge-queue', 'nightly', 'tag'];

/** Page-size presets offered by the "Jobs to load" filter. */
export const LIMIT_OPTIONS: readonly number[] = [
  ITEMS_DISPLAYED_STEP,
  ITEMS_DISPLAYED_STEP * 3,
  ITEMS_DISPLAYED_STEP * 5,
  ITEMS_DISPLAYED_STEP * 10,
];

/** PR labels offered as quick filters (matched client-side). */
export const LABEL_OPTIONS: readonly string[] = [
  'CI: ready for build',
  'CI: full build',
  'CI: skip compile test',
  'CI: no fast fail',
];

export function defaultQuery(): QueryParams {
  return {
    limit: ITEMS_DISPLAYED_STEP,
    type: 'all',
    states: [...STATES],
    prnum: '',
    prstates: { open: true, closed: true },
    branch: '',
    tag: '',
    sha: '',
    author: '',
    search: '',
    labels: [],
  };
}

/** How far the applied filters deviate from the defaults. */
export function activeFilterCount(params: QueryParams): number {
  return (
    (params.type !== 'all' ? 1 : 0) +
    (params.states.length < STATES.length ? 1 : 0) +
    (params.type === 'pr' && (!params.prstates.open || !params.prstates.closed) ? 1 : 0) +
    (params.sha ? 1 : 0) +
    (params.author ? 1 : 0) +
    (params.search.trim() ? 1 : 0) +
    (params.labels.length ? 1 : 0) +
    (params.type === 'pr' && params.prnum ? 1 : 0) +
    (params.type === 'branch' && params.branch ? 1 : 0) +
    (params.type === 'tag' && params.tag ? 1 : 0)
  );
}

export function queryParamsToApiQuery(params: QueryParams): string {
  const parts = [`limit=${params.limit}`, `states=${params.states.join('+')}`];

  if (params.type === 'pr') {
    const prstates: string[] = [];
    if (params.prstates.open) prstates.push('open');
    if (params.prstates.closed) prstates.push('closed');
    parts.push('is_pr=true', `prstates=${prstates.join('+')}`);
  }
  if (['branch', 'merge-queue', 'nightly'].includes(params.type)) parts.push('is_branch=true');
  if (params.type === 'tag') parts.push('is_tag=true');

  if (params.type === 'pr' && params.prnum) parts.push(`prnum=${encodeURIComponent(params.prnum)}`);
  if (params.type === 'branch' && params.branch) parts.push(`branch=${encodeURIComponent(params.branch)}`);
  if (params.type === 'tag' && params.tag) parts.push(`tag=${encodeURIComponent(params.tag)}`);
  if (params.sha) parts.push(`sha=${encodeURIComponent(params.sha)}`);
  if (params.author) parts.push(`author=${encodeURIComponent(params.author)}`);

  return parts.join('&');
}

export function queryParamsToSearchParams(params: QueryParams): URLSearchParams {
  const search = new URLSearchParams();

  if (Number(params.limit) !== ITEMS_DISPLAYED_STEP) search.set('limit', String(params.limit));
  if (params.type !== 'all') search.set('type', params.type);
  if (params.states.length < STATES.length) search.set('states', params.states.join(' '));

  if (params.type === 'pr') {
    if (params.prstates.open && !params.prstates.closed) search.set('prstates', 'open');
    else if (!params.prstates.open && params.prstates.closed) search.set('prstates', 'closed');
  }
  if (params.type === 'branch' && params.branch) search.set('branch', params.branch);
  if (params.type === 'tag' && params.tag) search.set('tag', params.tag);
  if (params.type === 'pr' && params.prnum) search.set('prnum', params.prnum);
  if (params.sha) search.set('sha', params.sha);
  if (params.author) search.set('author', params.author);
  if (params.search) search.set('search', params.search);
  for (const label of params.labels) search.append('labels', label);

  return search;
}

export function queryParamsToUrl(params: QueryParams): string {
  const query = queryParamsToSearchParams(params).toString();
  return query ? `?${query}` : '';
}

export function queryStringToQueryParams(queryString: string): QueryParams {
  const params = defaultQuery();

  for (const [param, value] of new URLSearchParams(queryString)) {
    switch (param) {
      case 'limit': {
        const limit = Number.parseInt(value, 10);
        if (Number.isFinite(limit) && limit > 0) params.limit = limit;
        break;
      }
      case 'type':
        if ((JOB_TYPES as readonly string[]).includes(value)) params.type = value as JobType;
        break;
      case 'states': {
        const states = value
          .split(' ')
          .filter((state): state is JobState => (STATES as readonly string[]).includes(state));
        // An empty selection would ask the API for nothing, so keep the default.
        if (states.length) params.states = states;
        break;
      }
      case 'prstates':
        params.prstates.open = value.includes('open');
        params.prstates.closed = value.includes('closed');
        break;
      case 'prnum':
        params.prnum = value;
        break;
      case 'branch':
        params.branch = value;
        break;
      case 'tag':
        params.tag = value;
        break;
      case 'sha':
        params.sha = value;
        break;
      case 'author':
        params.author = value;
        break;
      case 'search':
        params.search = value;
        break;
      case 'labels':
        if (value) params.labels.push(value);
        break;
      default:
        break;
    }
  }

  return params;
}
