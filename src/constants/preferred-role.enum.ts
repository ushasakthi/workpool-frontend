// Must match backend PreferredRole. Not the same as UserRole, it's just
// which mode a "both" user starts in.
export enum PreferredRole {
  DRIVER = 'driver',
  PASSENGER = 'passenger',
  EITHER = 'either',
}
