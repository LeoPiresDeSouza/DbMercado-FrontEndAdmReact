/**
 * Rótulo curto de tempo relativo para timestamps ISO (UTC).
 * Usa `Intl.RelativeTimeFormat` com locale BCP-47.
 */
export function formatChatRelativeTime(isoUtc: string, localeBcp47: string): string {
  const then = new Date(isoUtc).getTime();
  if (Number.isNaN(then)) {
    return '';
  }
  const now = Date.now();
  let diffSec = Math.round((then - now) / 1000);
  const rtf = new Intl.RelativeTimeFormat(localeBcp47, { numeric: 'auto' });

  const absSec = Math.abs(diffSec);
  if (absSec < 60) {
    return rtf.format(diffSec, 'second');
  }

  let diffMin = Math.round(diffSec / 60);
  const absMin = Math.abs(diffMin);
  if (absMin < 60) {
    return rtf.format(diffMin, 'minute');
  }

  let diffHour = Math.round(diffMin / 60);
  const absHour = Math.abs(diffHour);
  if (absHour < 24) {
    return rtf.format(diffHour, 'hour');
  }

  const diffDay = Math.round(diffHour / 24);
  const absDay = Math.abs(diffDay);
  if (absDay < 30) {
    return rtf.format(diffDay, 'day');
  }

  const diffMonth = Math.round(diffDay / 30);
  const absMonth = Math.abs(diffMonth);
  if (absMonth < 12) {
    return rtf.format(diffMonth, 'month');
  }

  const diffYear = Math.round(diffMonth / 12);
  return rtf.format(diffYear, 'year');
}
