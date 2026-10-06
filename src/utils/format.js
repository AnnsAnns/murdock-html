// Formatting helpers. Replaces moment with the native Intl APIs.

const relative = new Intl.RelativeTimeFormat(undefined, { numeric: 'auto' });

const UNITS = [
  ['year', 31536000000],
  ['month', 2592000000],
  ['day', 86400000],
  ['hour', 3600000],
  ['minute', 60000],
  ['second', 1000],
];

/** "in 5 minutes" / "3 hours ago" for a date. */
export function relativeTime(date) {
  const diff = date.getTime() - Date.now();
  const abs = Math.abs(diff);
  for (const [unit, ms] of UNITS) {
    if (abs >= ms || unit === 'second') {
      return relative.format(Math.round(diff / ms), unit);
    }
  }
  return relative.format(0, 'second');
}

/**
 * Exact "time from now" for an ETA given in seconds, e.g. "in 62 min",
 * "in 1h 5m", "in 2d 3h". More precise than a rounded "in about 1 hour".
 */
export function formatEta(seconds) {
  const total = Math.max(0, Math.round(seconds));
  if (total < 60) return `in ${total}s`;
  if (total < 7200) return `in ${Math.round(total / 60)} min`;
  if (total < 86400) {
    const hours = Math.floor(total / 3600);
    const minutes = Math.floor((total % 3600) / 60);
    return `in ${hours}h ${minutes}m`;
  }
  const days = Math.floor(total / 86400);
  const hours = Math.floor((total % 86400) / 3600);
  return `in ${days}d ${hours}h`;
}

/**
 * Precise "1d 02h 03m 04s" duration from a value in seconds, matching the
 * original Murdock formatting.
 */
export function preciseDuration(value) {
  const total = Math.max(0, Math.floor(value));
  const days = Math.floor(total / 86400);
  const hours = Math.floor((total % 86400) / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const seconds = total % 60;

  const parts = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0) parts.push(`${String(hours).padStart(2, '0')}h`);
  if (minutes > 0) parts.push(`${String(minutes).padStart(2, '0')}m`);
  parts.push(`${String(seconds).padStart(2, '0')}s`);
  return parts.join(' ');
}

/**
 * Compact "Day.Month, HH:mm" (24-hour) date, e.g. "6.10, 15:26".
 * Used for the start/end columns and the job header.
 */
export function formatDayMonthTime(date) {
  const day = date.getDate();
  const month = date.getMonth() + 1;
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${day}.${month}, ${hours}:${minutes}`;
}
