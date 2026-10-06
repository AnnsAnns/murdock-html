import { describe, expect, it } from 'vitest';
import { ITEMS_DISPLAYED_STEP } from './config';
import {
  defaultQuery,
  queryParamsToApiQuery,
  queryParamsToUrl,
  queryStringToQueryParams,
} from './query';

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
});

describe('URL round-trip', () => {
  it('preserves PR filters', () => {
    const params = {
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
});
