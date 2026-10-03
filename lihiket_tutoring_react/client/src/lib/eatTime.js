/**
 * Ethiopian time helpers — all output in Africa/Addis_Ababa (EAT = UTC+3).
 * Use these everywhere a schedule date/time is shown to users.
 */

const TZ = 'Africa/Addis_Ababa';

/** "Fri, Oct 2" */
export function eatDate(d) {
  if (!d) return '';
  return new Date(d).toLocaleDateString('en-US', {
    timeZone: TZ,
    weekday: 'short',
    month:   'short',
    day:     'numeric',
  });
}

/** "01:32 AM" */
export function eatTime(d) {
  if (!d) return '';
  return new Date(d).toLocaleTimeString('en-US', {
    timeZone: TZ,
    hour:     '2-digit',
    minute:   '2-digit',
    hour12:   true,
  });
}

/** "Fri, Oct 2 · 01:32 AM" */
export function eatDateTime(d) {
  if (!d) return '—';
  return `${eatDate(d)} · ${eatTime(d)}`;
}

/** "Oct 2, 2025, 01:32 AM" — for detail views */
export function eatFull(d) {
  if (!d) return '—';
  return new Date(d).toLocaleString('en-US', {
    timeZone: TZ,
    month:    'short',
    day:      'numeric',
    year:     'numeric',
    hour:     '2-digit',
    minute:   '2-digit',
    hour12:   true,
  });
}

/** "Oct 2 · 01:32 AM" — compact for cards */
export function eatShort(d) {
  if (!d) return null;
  return new Date(d).toLocaleDateString('en-US', {
    timeZone: TZ,
    month:    'short',
    day:      'numeric',
    hour:     '2-digit',
    minute:   '2-digit',
    hour12:   true,
  });
}
