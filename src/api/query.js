// Job-list query <-> API/URL serialisation.
// `states` and `prstates` are space-joined; the API receives them `+`-joined
// (URLSearchParams encodes a space as `+`, which the server splits back).

import { ITEMS_DISPLAYED_STEP } from './config';
import { STATES } from '../utils/state';

export const JOB_TYPES = ['all', 'pr', 'branch', 'tag'];

export function defaultQuery() {
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
  };
}

export function queryParamsToApiQuery(params) {
  const parts = [`limit=${params.limit}`, `states=${params.states.join('+')}`];

  if (params.type === 'pr') {
    const prstates = [];
    if (params.prstates.open) prstates.push('open');
    if (params.prstates.closed) prstates.push('closed');
    parts.push('is_pr=true', `prstates=${prstates.join('+')}`);
  }
  if (params.type === 'branch') parts.push('is_branch=true');
  if (params.type === 'tag') parts.push('is_tag=true');

  if (params.type === 'pr' && params.prnum) parts.push(`prnum=${encodeURIComponent(params.prnum)}`);
  if (params.type === 'branch' && params.branch) parts.push(`branch=${encodeURIComponent(params.branch)}`);
  if (params.type === 'tag' && params.tag) parts.push(`tag=${encodeURIComponent(params.tag)}`);
  if (params.sha) parts.push(`sha=${encodeURIComponent(params.sha)}`);
  if (params.author) parts.push(`author=${encodeURIComponent(params.author)}`);

  return parts.join('&');
}

export function queryParamsToSearchParams(params) {
  const search = new URLSearchParams();

  if (Number(params.limit) !== ITEMS_DISPLAYED_STEP) search.set('limit', String(params.limit));
  if (['pr', 'branch', 'tag'].includes(params.type)) search.set('type', params.type);
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

  return search;
}

export function queryParamsToUrl(params) {
  const query = queryParamsToSearchParams(params).toString();
  return query ? `?${query}` : '';
}

export function queryStringToQueryParams(queryString) {
  const params = defaultQuery();

  for (const [param, value] of new URLSearchParams(queryString)) {
    switch (param) {
      case 'limit': {
        const limit = Number.parseInt(value, 10);
        if (Number.isFinite(limit) && limit > 0) params.limit = limit;
        break;
      }
      case 'type':
        if (['pr', 'branch', 'tag'].includes(value)) params.type = value;
        break;
      case 'states':
        params.states = value.split(' ').filter((state) => STATES.includes(state));
        break;
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
      default:
        break;
    }
  }

  return params;
}
