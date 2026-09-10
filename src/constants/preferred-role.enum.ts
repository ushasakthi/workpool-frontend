// Mirrors the backend PreferredRole enum value-for-value. Not the same as UserRole:
// this is only which mode the app opens in by default for a "both" user.
export enum PreferredRole {
  DRIVER = 'driver',
  PASSENGER = 'passenger',
  EITHER = 'either',
}
