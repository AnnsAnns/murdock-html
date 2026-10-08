// Formatting helpers. Replaces moment with the native Intl APIs.

const relative = new Intl.RelativeTimeFormat(undefined, { numeric: 'auto' });

const UNITS: [Intl.RelativeTimeFormatUnit, number][] = [
  ['year', 31536000000],
  ['month', 2592000000],
  ['day', 86400000],
  ['hour', 3600000],
  ['minute', 60000],
  ['second', 1000],
];

/** "in 5 minutes" / "3 hours ago" for a date. */
export function relativeTime(date: Date): string {
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
export function formatEta(seconds: number): string {
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
 * Compact duration from a value in seconds: "45s", "15m", "2h", "2h 30m".
 * Used for the estimated runtime of a queued job.
 */
export function compactDuration(value: number): string {
  const total = Math.max(0, Math.round(value));
  if (total < 60) return `${total}s`;
  const totalMinutes = Math.round(total / 60);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours > 0) return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
  return `${minutes}m`;
}

/**
 * Precise "1d 02h 03m 04s" duration from a value in seconds, matching the
 * original Murdock formatting.
 */
export function preciseDuration(value: number): string {
  const total = Math.max(0, Math.floor(value));
  const days = Math.floor(total / 86400);
  const hours = Math.floor((total % 86400) / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const seconds = total % 60;

  const parts: string[] = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0) parts.push(`${String(hours).padStart(2, '0')}h`);
  if (minutes > 0) parts.push(`${String(minutes).padStart(2, '0')}m`);
  parts.push(`${String(seconds).padStart(2, '0')}s`);
  return parts.join(' ');
}

/**
 * Compact "DD.MM., HH:mm" (24-hour) date, e.g. "06.10., 15:26".
 * Used for the start/end columns and the job header.
 */
export function formatDayMonthTime(date: Date): string {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${day}.${month}., ${hours}:${minutes}`;
}
