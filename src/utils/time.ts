// times are stored as "HH:mm" (24h) and shown as 12h

export const TIME_HHMM_REGEX = /^([01]\d|2[0-3]):[0-5]\d$/;

export function isValidHhMm(value: string): boolean {
  return TIME_HHMM_REGEX.test(value);
}

export function formatHhMmForDisplay(value: string): string {
  if (!isValidHhMm(value)) return value;
  const [hourStr, minute] = value.split(':');
  const hour = Number(hourStr);
  const period = hour < 12 ? 'AM' : 'PM';
  const displayHour = hour % 12 === 0 ? 12 : hour % 12;
  return `${displayHour}:${minute} ${period}`;
}

// every 30 min, for the time picker
function buildHalfHourSlots(): string[] {
  const slots: string[] = [];
  for (let hour = 0; hour < 24; hour++) {
    const hh = String(hour).padStart(2, '0');
    slots.push(`${hh}:00`);
    slots.push(`${hh}:30`);
  }
  return slots;
}

export const HALF_HOUR_SLOTS = buildHalfHourSlots();

// "08:00" + 30 -> "08:30", kept inside the same day
export function shiftHhMm(value: string, minutes: number): string {
  const [hours, mins] = value.split(':').map(Number);
  const total = Math.min(Math.max(hours * 60 + mins + minutes, 0), 23 * 60 + 59);
  const hh = String(Math.floor(total / 60)).padStart(2, '0');
  const mm = String(total % 60).padStart(2, '0');
  return `${hh}:${mm}`;
}

// "2026-10" -> "2026-09" / "2026-11"
export function shiftMonth(month: string, by: number): string {
  const [year, monthNumber] = month.split('-').map(Number);
  const date = new Date(Date.UTC(year, monthNumber - 1 + by, 1));
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}`;
}

// "2026-10" -> "October"
export function formatMonthName(month: string): string {
  const [year, monthNumber] = month.split('-').map(Number);
  return new Date(Date.UTC(year, monthNumber - 1, 1)).toLocaleDateString('en-US', {
    month: 'long',
    timeZone: 'UTC',
  });
}

// "2026-10" -> "October 2026"
export function formatMonth(month: string): string {
  const [year, monthNumber] = month.split('-').map(Number);
  return new Date(Date.UTC(year, monthNumber - 1, 1)).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  });
}
