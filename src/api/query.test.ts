import { describe, expect, it } from 'vitest';
import { ITEMS_DISPLAYED_STEP } from './config';
import {
  activeFilterCount,
  defaultQuery,
  queryParamsToApiQuery,
  queryParamsToUrl,
  queryStringToQueryParams,
} from './query';
import type { QueryParams } from '../types';

describe('queryParamsToApiQuery', () => {
  it('requests all states by default', () => {
    expect(queryParamsToApiQuery(defaultQuery())).toBe(
      `limit=${ITEMS_DISPLAYED_STEP}&states=queued+running+passed+errored+stopped`,
    );
  });

  it('adds the PR filters', () => {
    const query = queryParamsToApiQuery({
      ...defaultQuery(),
      type: 'pr',
      prstates: { open: true, closed: false },
      prnum: '42',
    });
    expect(query).toContain('is_pr=true');
    expect(query).toContain('prstates=open');
    expect(query).toContain('prnum=42');
  });

  it('asks for branch jobs for the merge-queue and nightly kinds', () => {
    expect(queryParamsToApiQuery({ ...defaultQuery(), type: 'merge-queue' })).toContain(
      'is_branch=true',
    );
    expect(queryParamsToApiQuery({ ...defaultQuery(), type: 'nightly' })).toContain('is_branch=true');
  });
});

describe('URL round-trip', () => {
  it('preserves PR filters', () => {
    const params: QueryParams = {
      ...defaultQuery(),
      type: 'pr',
      states: ['passed'],
      prstates: { open: true, closed: false },
      prnum: '42',
    };
    const parsed = queryStringToQueryParams(queryParamsToUrl(params));
    expect(parsed.type).toBe('pr');
    expect(parsed.states).toEqual(['passed']);
    expect(parsed.prstates).toEqual({ open: true, closed: false });
    expect(parsed.prnum).toBe('42');
  });

  it('omits defaults from the URL', () => {
    expect(queryParamsToUrl(defaultQuery())).toBe('');
  });

  it('round-trips the merge-queue and nightly kinds', () => {
    for (const type of ['merge-queue', 'nightly'] as const) {
      const parsed = queryStringToQueryParams(queryParamsToUrl({ ...defaultQuery(), type }));
      expect(parsed.type).toBe(type);
    }
  });

  it('round-trips the search text and PR labels', () => {
    const params: QueryParams = {
      ...defaultQuery(),
      search: 'fix the thing',
      labels: ['CI: full build', 'CI: no fast fail'],
    };
    const parsed = queryStringToQueryParams(queryParamsToUrl(params));
    expect(parsed.search).toBe('fix the thing');
    expect(parsed.labels).toEqual(['CI: full build', 'CI: no fast fail']);
  });
});

describe('activeFilterCount', () => {
  it('counts a non-default type', () => {
    expect(activeFilterCount({ ...defaultQuery(), type: 'branch' })).toBe(1);
    expect(activeFilterCount({ ...defaultQuery(), type: 'nightly' })).toBe(1);
  });

  it('counts search and labels, ignoring blank search', () => {
    expect(activeFilterCount({ ...defaultQuery(), search: 'x' })).toBe(1);
    expect(activeFilterCount({ ...defaultQuery(), search: '   ' })).toBe(0);
    expect(activeFilterCount({ ...defaultQuery(), labels: ['CI: full build'] })).toBe(1);
  });
});
