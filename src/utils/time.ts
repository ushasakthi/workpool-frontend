// Work start/end times are stored as 24-hour "HH:mm" strings (the backend's TIME_HHMM_REGEX)
// and shown to the user in 12-hour form.

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

// Every :00 and :30 across the day — the options offered by the time picker.
export const HALF_HOUR_SLOTS: string[] = Array.from({ length: 48 }, (_, i) => {
  const hour = Math.floor(i / 2);
  const minute = i % 2 === 0 ? '00' : '30';
  return `${String(hour).padStart(2, '0')}:${minute}`;
});
