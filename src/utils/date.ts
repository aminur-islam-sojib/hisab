import {
  format,
  parse,
  subDays,
  addDays,
  isToday,
  isYesterday,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  isSameMonth,
  isSameWeek,
  isValid,
} from 'date-fns';

export const LOCAL_DATE_FORMAT = 'yyyy-MM-dd';

/**
 * Returns today's date formatted as local 'YYYY-MM-DD'.
 * Guaranteed not to suffer from UTC timezone offset shifts.
 */
export function getLocalTodayDateString(): string {
  return format(new Date(), LOCAL_DATE_FORMAT);
}

/**
 * Returns yesterday's date formatted as local 'YYYY-MM-DD'.
 */
export function getYesterdayDateString(): string {
  return format(subDays(new Date(), 1), LOCAL_DATE_FORMAT);
}

/**
 * Formats a Date object or Unix timestamp into local 'YYYY-MM-DD'.
 */
export function formatDateToLocalString(date: Date | number): string {
  return format(date, LOCAL_DATE_FORMAT);
}

/**
 * Parses a local 'YYYY-MM-DD' string back into a JavaScript Date object (at 00:00:00 local time).
 */
export function parseLocalDateString(dateStr: string): Date {
  const parsed = parse(dateStr, LOCAL_DATE_FORMAT, new Date());
  return isValid(parsed) ? parsed : new Date();
}

/**
 * Formats a 'YYYY-MM-DD' string for user-facing UI.
 * If showRelative is true:
 * - Today -> "Today"
 * - Yesterday -> "Yesterday"
 * - Other -> "Nov 15, 2026"
 */
export function formatDisplayDate(
  dateStr: string,
  options: { showRelative?: boolean } = { showRelative: true }
): string {
  const parsed = parseLocalDateString(dateStr);

  if (options.showRelative) {
    if (isToday(parsed)) return 'Today';
    if (isYesterday(parsed)) return 'Yesterday';
  }

  return format(parsed, 'MMM d, yyyy');
}

/**
 * Formats date string for sticky section headers in history list.
 * E.g., "Nov 15, 2026 — Today" or "Nov 14, 2026 — Yesterday" or "Nov 10, 2026"
 */
export function formatDisplayHeader(dateStr: string): string {
  const parsed = parseLocalDateString(dateStr);
  if (isToday(parsed)) {
    return `${format(parsed, 'MMM d, yyyy')} — Today`;
  }
  if (isYesterday(parsed)) {
    return `${format(parsed, 'MMM d, yyyy')} — Yesterday`;
  }
  return format(parsed, 'MMM d, yyyy');
}

/**
 * Formats Unix epoch milliseconds into a readable local time (e.g. "04:30 PM").
 */
export function formatDisplayTime(timestamp: number): string {
  return format(new Date(timestamp), 'hh:mm a');
}

/**
 * Returns the start of month 'YYYY-MM-DD' for a given reference date (defaults to today).
 */
export function getStartOfMonthDateString(date: Date = new Date()): string {
  return format(startOfMonth(date), LOCAL_DATE_FORMAT);
}

/**
 * Returns the end of month 'YYYY-MM-DD' for a given reference date (defaults to today).
 */
export function getEndOfMonthDateString(date: Date = new Date()): string {
  return format(endOfMonth(date), LOCAL_DATE_FORMAT);
}

/**
 * Returns the start of week 'YYYY-MM-DD' for a given reference date (Saturday for Bangladesh or Monday).
 * Defaulting weekStartsOn: 1 (Monday) or 6 (Saturday). Here weekStartsOn: 0 (Sunday) or 1 (Monday).
 */
export function getStartOfWeekDateString(date: Date = new Date(), weekStartsOn: 0 | 1 | 6 = 1): string {
  return format(startOfWeek(date, { weekStartsOn }), LOCAL_DATE_FORMAT);
}

/**
 * Returns the end of week 'YYYY-MM-DD' for a given reference date.
 */
export function getEndOfWeekDateString(date: Date = new Date(), weekStartsOn: 0 | 1 | 6 = 1): string {
  return format(endOfWeek(date, { weekStartsOn }), LOCAL_DATE_FORMAT);
}

/**
 * Returns an array of 'YYYY-MM-DD' strings for the past N days ending on endDate (inclusive).
 */
export function getPastNDaysDateStrings(daysCount: number, endDate: Date = new Date()): string[] {
  const result: string[] = [];
  for (let i = daysCount - 1; i >= 0; i--) {
    result.push(format(subDays(endDate, i), LOCAL_DATE_FORMAT));
  }
  return result;
}

/**
 * Checks if a 'YYYY-MM-DD' date string falls in the same calendar month as referenceDate.
 */
export function isDateInMonth(dateStr: string, referenceDate: Date = new Date()): boolean {
  const parsed = parseLocalDateString(dateStr);
  return isSameMonth(parsed, referenceDate);
}

/**
 * Checks if a 'YYYY-MM-DD' date string falls in the same calendar week as referenceDate.
 */
export function isDateInWeek(dateStr: string, referenceDate: Date = new Date(), weekStartsOn: 0 | 1 | 6 = 1): boolean {
  const parsed = parseLocalDateString(dateStr);
  return isSameWeek(parsed, referenceDate, { weekStartsOn });
}

/**
 * Checks if a 'YYYY-MM-DD' date string falls within [startDateStr, endDateStr] (inclusive).
 */
export function isDateInRange(dateStr: string, startDateStr?: string, endDateStr?: string): boolean {
  if (startDateStr && dateStr < startDateStr) return false;
  if (endDateStr && dateStr > endDateStr) return false;
  return true;
}
