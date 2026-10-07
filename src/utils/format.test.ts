import { describe, expect, it } from 'vitest';
import { formatDayMonthTime, formatEta, preciseDuration } from './format';

describe('formatEta', () => {
  it('shows minutes for sub-2h ETAs instead of a rounded hour', () => {
    expect(formatEta(62 * 60)).toBe('in 62 min');
    expect(formatEta(90 * 60)).toBe('in 90 min');
  });

  it('shows hours and minutes for longer ETAs', () => {
    expect(formatEta(2 * 3600 + 5 * 60)).toBe('in 2h 5m');
  });

  it('shows days and hours for multi-day ETAs', () => {
    expect(formatEta(2 * 86400 + 3 * 3600)).toBe('in 2d 3h');
  });

  it('shows seconds for very short ETAs', () => {
    expect(formatEta(45)).toBe('in 45s');
    expect(formatEta(0)).toBe('in 0s');
  });
});

describe('formatDayMonthTime', () => {
  it('formats as Day.Month, HH:mm in 24-hour time', () => {
    expect(formatDayMonthTime(new Date(2026, 9, 6, 15, 26))).toBe('6.10, 15:26');
    expect(formatDayMonthTime(new Date(2026, 0, 1, 9, 5))).toBe('1.1, 09:05');
  });

  it('pads the time to two digits', () => {
    expect(formatDayMonthTime(new Date(2026, 11, 24, 0, 0))).toBe('24.12, 00:00');
  });
});

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
