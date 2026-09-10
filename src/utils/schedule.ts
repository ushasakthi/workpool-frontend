import { Weekday } from '@/constants/weekday.enum';
import { formatHhMmForDisplay } from '@/utils/time';

const ORDERED: Weekday[] = [
  Weekday.MON,
  Weekday.TUE,
  Weekday.WED,
  Weekday.THU,
  Weekday.FRI,
  Weekday.SAT,
  Weekday.SUN,
];

// Weekday enum value → JS Date.getDay() index (Sun = 0).
const DAY_JS_INDEX: Record<Weekday, number> = {
  [Weekday.SUN]: 0,
  [Weekday.MON]: 1,
  [Weekday.TUE]: 2,
  [Weekday.WED]: 3,
  [Weekday.THU]: 4,
  [Weekday.FRI]: 5,
  [Weekday.SAT]: 6,
};

// The soonest instant strictly after `from` that falls on one of `days` at `hhmm`.
// The backend stores an absolute `departureTime`; the form only asks for a
// recurring time-of-day + weekdays, so this derives the next real occurrence.
export function nextOccurrence(
  hhmm: string,
  days: Weekday[],
  from: Date = new Date(),
): Date {
  const [hourStr, minuteStr] = hhmm.split(':');
  const hours = Number(hourStr);
  const minutes = Number(minuteStr);
  const wanted = new Set(days.map((day) => DAY_JS_INDEX[day]));

  for (let offset = 0; offset <= 7; offset++) {
    const candidate = new Date(from);
    candidate.setDate(from.getDate() + offset);
    candidate.setHours(hours, minutes, 0, 0);
    if (wanted.has(candidate.getDay()) && candidate.getTime() > from.getTime()) {
      return candidate;
    }
  }

  // Unreachable when `days` is non-empty; keeps the return type total.
  const fallback = new Date(from);
  fallback.setDate(from.getDate() + 1);
  fallback.setHours(hours, minutes, 0, 0);
  return fallback;
}

export function timeOfDayFromISO(iso: string): string {
  const date = new Date(iso);
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
}

// "Mo Tu We Th Fr · 8:15 AM"
export function formatRideSchedule(
  daysOfWeek: Weekday[],
  departureTimeISO: string,
): string {
  const days = ORDERED.filter((day) => daysOfWeek.includes(day))
    .map((day) => day.slice(0, 2))
    .join(' ');
  const time = formatHhMmForDisplay(timeOfDayFromISO(departureTimeISO));
  return days ? `${days} · ${time}` : time;
}
