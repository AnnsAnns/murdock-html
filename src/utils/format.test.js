import { describe, expect, it } from 'vitest';
import { preciseDuration } from './format';

describe('preciseDuration', () => {
  it('formats sub-minute durations with padded seconds', () => {
    expect(preciseDuration(0)).toBe('00s');
    expect(preciseDuration(5)).toBe('05s');
    expect(preciseDuration(59)).toBe('59s');
  });

  it('adds padded minutes and hours only when non-zero', () => {
    expect(preciseDuration(61)).toBe('01m 01s');
    expect(preciseDuration(3661)).toBe('01h 01m 01s');
  });

  it('includes days without padding', () => {
    expect(preciseDuration(90061)).toBe('1d 01h 01m 01s');
  });

  it('clamps negative input', () => {
    expect(preciseDuration(-5)).toBe('00s');
  });
});
