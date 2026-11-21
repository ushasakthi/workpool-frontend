// Must match the backend Weekday enum
export enum Weekday {
  MON = 'Mon',
  TUE = 'Tue',
  WED = 'Wed',
  THU = 'Thu',
  FRI = 'Fri',
  SAT = 'Sat',
  SUN = 'Sun',
}

// short = 1 letter, medium = 2 letters
export const WEEKDAYS_IN_ORDER: { value: Weekday; short: string; medium: string }[] = [
  { value: Weekday.MON, short: 'M', medium: 'Mo' },
  { value: Weekday.TUE, short: 'T', medium: 'Tu' },
  { value: Weekday.WED, short: 'W', medium: 'We' },
  { value: Weekday.THU, short: 'T', medium: 'Th' },
  { value: Weekday.FRI, short: 'F', medium: 'Fr' },
  { value: Weekday.SAT, short: 'S', medium: 'Sa' },
  { value: Weekday.SUN, short: 'S', medium: 'Su' },
];
