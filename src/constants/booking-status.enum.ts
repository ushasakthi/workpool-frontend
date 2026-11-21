export enum BookingStatus {
  REQUESTED = 'requested',
  ACCEPTED = 'accepted',
  REJECTED = 'rejected',
  CANCELLED = 'cancelled',
  COMPLETED = 'completed',
  // the driver finished the trip without picking this passenger up
  NOT_PICKED_UP = 'not_picked_up',
}
