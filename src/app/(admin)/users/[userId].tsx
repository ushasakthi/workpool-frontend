import { type ExternalPathString, useLocalSearchParams, useRouter } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { type ReactNode, useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { getUserDetail } from '@/api/admin.api';
import { Avatar } from '@/components/admin/avatar';
import { type BadgeTone, StatusBadge, statusBadgeTone } from '@/components/admin/status-badge';
import { ExternalLink } from '@/components/external-link';
import { ThemedText } from '@/components/themed-text';
import { Banner } from '@/components/ui/banner';
import { BookingStatus } from '@/constants/booking-status.enum';
import { Icons } from '@/constants/icons';
import { RideStatus } from '@/constants/ride-status.enum';
import { Spacing } from '@/constants/theme';
import { UserRole } from '@/constants/user-role.enum';
import { WEEKDAYS_IN_ORDER, type Weekday } from '@/constants/weekday.enum';
import { useTheme } from '@/hooks/use-theme';
import type { AdminUserDetail } from '@/types/admin.types';
import { getErrorMessage } from '@/utils/errors';
import { formatClockTime, formatCost, formatDate } from '@/utils/formatters';

const ROLE_LABEL: Record<UserRole, string> = {
  [UserRole.DRIVER]: 'Driver',
  [UserRole.PASSENGER]: 'Passenger',
  [UserRole.BOTH]: 'Both',
  [UserRole.ADMIN]: 'Admin',
};

const RIDE_STATUS_BADGE: Record<RideStatus, { label: string; tone: BadgeTone }> = {
  [RideStatus.ACTIVE]: { label: 'Active', tone: 'verified' },
  [RideStatus.PAUSED]: { label: 'Paused', tone: 'pending' },
  [RideStatus.CANCELLED]: { label: 'Cancelled', tone: 'rejected' },
};

const BOOKING_STATUS_BADGE: Record<BookingStatus, { label: string; tone: BadgeTone }> = {
  [BookingStatus.REQUESTED]: { label: 'Requested', tone: 'pending' },
  [BookingStatus.ACCEPTED]: { label: 'Accepted', tone: 'verified' },
  [BookingStatus.REJECTED]: { label: 'Declined', tone: 'rejected' },
  [BookingStatus.CANCELLED]: { label: 'Cancelled', tone: 'rejected' },
  [BookingStatus.COMPLETED]: { label: 'Completed', tone: 'neutral' },
  [BookingStatus.NOT_PICKED_UP]: { label: 'Not picked up', tone: 'pending' },
};

// ['Wed', 'Mon'] -> "Mon, Wed"
function formatDays(days: Weekday[]): string {
  const sorted = WEEKDAYS_IN_ORDER.filter((day) => days.includes(day.value));
  return sorted.length > 0 ? sorted.map((day) => day.value).join(', ') : '—';
}

function formatDateTime(iso: string): string {
  return `${formatDate(iso)}, ${formatClockTime(iso)}`;
}

function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

export default function AdminUserDetailScreen() {
  const { userId } = useLocalSearchParams<{ userId: string }>();
  const router = useRouter();
  const theme = useTheme();

  const [user, setUser] = useState<AdminUserDetail | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // stops a slow response for the previous user from replacing this one
    let cancelled = false;

    getUserDetail(userId)
      .then((data) => {
        if (!cancelled) setUser(data);
      })
      .catch((err) => {
        if (!cancelled) setError(getErrorMessage(err));
      });

    return () => {
      cancelled = true;
    };
  }, [userId]);

  if (!user) {
    return (
      <View style={styles.loadingContainer}>
        {error ? <Banner message={error} /> : <ActivityIndicator color={theme.primary} />}
      </View>
    );
  }

  const travel = user.travelProfile;
  const hasTravelProfile = Boolean(travel?.homeLocation || travel?.workLocation);

  return (
    <View style={styles.flex}>
      <View style={[styles.breadcrumbBar, { borderBottomColor: theme.border }]}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Back to users"
          onPress={() => router.back()}
          style={[styles.backButton, { borderColor: theme.border }]}>
          <SymbolView name={Icons.back} size={16} tintColor={theme.text} />
        </Pressable>
        <View style={styles.grow}>
          <Pressable onPress={() => router.back()}>
            <ThemedText type="small" themeColor="textSecondary">
              Users
            </ThemedText>
          </Pressable>
          <ThemedText type="smallBold" style={styles.pageTitle}>
            {user.name}
          </ThemedText>
        </View>
        {user.suspended ? (
          <StatusBadge label="Suspended" tone="rejected" />
        ) : (
          <StatusBadge label="Active" tone="verified" />
        )}
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {user.suspended && user.suspensionReason && (
          <Banner message={`Suspended: ${user.suspensionReason}`} />
        )}

        <View style={styles.columns}>
          <View style={styles.column}>
            <Section title="PROFILE">
              <View style={styles.profileHeader}>
                <Avatar name={user.name} size={48} />
                <View style={styles.grow}>
                  <ThemedText type="smallBold">{user.name}</ThemedText>
                  <ThemedText type="small" themeColor="textSecondary">
                    {ROLE_LABEL[user.role]} · Joined {formatDate(user.createdAt)}
                  </ThemedText>
                </View>
              </View>
              <InfoRow label="Email" value={user.email} />
              <InfoRow label="Phone" value={user.phone} />
              <InfoRow label="Trust Score" value={user.trustScore === null ? '—' : `${user.trustScore} / 100`} />
              <View style={styles.infoRow}>
                <ThemedText themeColor="textSecondary">Identity (NIC)</ThemedText>
                <StatusBadge
                  label={capitalize(user.verification.identityStatus)}
                  tone={statusBadgeTone(user.verification.identityStatus)}
                />
              </View>
              <View style={styles.infoRow}>
                <ThemedText themeColor="textSecondary">Workplace (LinkedIn)</ThemedText>
                <StatusBadge
                  label={capitalize(user.verification.workplaceStatus)}
                  tone={statusBadgeTone(user.verification.workplaceStatus)}
                />
              </View>
              {user.linkedinUrl && (
                <ExternalLink href={user.linkedinUrl as ExternalPathString}>
                  <ThemedText type="small" themeColor="primary" numberOfLines={1} style={styles.link}>
                    {user.linkedinUrl}
                  </ThemedText>
                </ExternalLink>
              )}
            </Section>

            <Section title="EMERGENCY CONTACT">
              {user.emergencyContact ? (
                <>
                  <InfoRow label="Name" value={user.emergencyContact.name} />
                  <InfoRow label="Phone" value={user.emergencyContact.phone} />
                </>
              ) : (
                <EmptyText text="No emergency contact added." />
              )}
            </Section>

            <Section title="TRAVEL PROFILE">
              {hasTravelProfile && travel ? (
                <>
                  <InfoRow label="Home" value={travel.homeLocation?.label ?? '—'} />
                  <InfoRow label="Work" value={travel.workLocation?.label ?? '—'} />
                  <InfoRow
                    label="Work hours"
                    value={
                      travel.workStartTime && travel.workEndTime
                        ? `${travel.workStartTime} – ${travel.workEndTime}`
                        : '—'
                    }
                  />
                  <InfoRow label="Days" value={formatDays(travel.daysAvailable)} />
                  <InfoRow
                    label="Prefers"
                    value={travel.preferredRole ? capitalize(travel.preferredRole) : '—'}
                  />
                </>
              ) : (
                <EmptyText text="Travel profile not set up yet." />
              )}
            </Section>
          </View>

          <View style={styles.column}>
            <Section title={`VEHICLES (${user.vehicles.length})`}>
              {user.vehicles.length === 0 && <EmptyText text="No vehicles added." />}
              {user.vehicles.map((vehicle) => (
                <View key={vehicle.id} style={[styles.card, { borderColor: theme.border }]}>
                  <View style={styles.grow}>
                    <ThemedText type="smallBold">
                      {vehicle.make} {vehicle.model} ({vehicle.year})
                    </ThemedText>
                    <ThemedText type="small" themeColor="textSecondary">
                      {vehicle.plateNumber} · {vehicle.seatsAvailable} seats
                    </ThemedText>
                  </View>
                  <StatusBadge
                    label={vehicle.isActive ? 'Active' : 'Inactive'}
                    tone={vehicle.isActive ? 'verified' : 'neutral'}
                  />
                </View>
              ))}
            </Section>

            <Section title={`RIDES OFFERED (${user.ridesOffered.length})`}>
              {user.ridesOffered.length === 0 && <EmptyText text="Hasn't offered any rides." />}
              {user.ridesOffered.map((ride) => (
                <View key={ride.id} style={[styles.card, { borderColor: theme.border }]}>
                  <View style={styles.grow}>
                    <ThemedText type="smallBold" numberOfLines={1}>
                      {ride.origin.label ?? 'Start'} → {ride.destination.label ?? 'End'}
                    </ThemedText>
                    <ThemedText type="small" themeColor="textSecondary">
                      {formatDateTime(ride.departureTime)} · {formatDays(ride.daysOfWeek)}
                    </ThemedText>
                    <ThemedText type="small" themeColor="textSecondary">
                      {ride.seatsAvailable} seats · {formatCost(ride.costContribution)} shared cost
                    </ThemedText>
                  </View>
                  <StatusBadge
                    label={RIDE_STATUS_BADGE[ride.status].label}
                    tone={RIDE_STATUS_BADGE[ride.status].tone}
                  />
                </View>
              ))}
            </Section>

            <Section title={`RIDES JOINED (${user.ridesJoined.length})`}>
              {user.ridesJoined.length === 0 && <EmptyText text="Hasn't joined any rides." />}
              {user.ridesJoined.map((trip) => (
                <View key={trip.bookingId} style={[styles.card, { borderColor: theme.border }]}>
                  <View style={styles.grow}>
                    <ThemedText type="smallBold" numberOfLines={1}>
                      {trip.ride
                        ? `${trip.ride.origin.label ?? 'Start'} → ${trip.ride.destination.label ?? 'End'}`
                        : 'Ride no longer available'}
                    </ThemedText>
                    <ThemedText type="small" themeColor="textSecondary">
                      {trip.ride ? formatDateTime(trip.ride.departureTime) : `Requested ${formatDate(trip.requestedAt)}`}
                      {' · '}
                      {trip.seatsRequested} seat{trip.seatsRequested === 1 ? '' : 's'}
                    </ThemedText>
                  </View>
                  <StatusBadge
                    label={BOOKING_STATUS_BADGE[trip.status].label}
                    tone={BOOKING_STATUS_BADGE[trip.status].tone}
                  />
                </View>
              ))}
            </Section>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  const theme = useTheme();
  return (
    <View style={[styles.section, { backgroundColor: theme.background, borderColor: theme.border }]}>
      <ThemedText type="small" themeColor="textSecondary" style={styles.sectionLabel}>
        {title}
      </ThemedText>
      {children}
    </View>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <ThemedText themeColor="textSecondary">{label}</ThemedText>
      <ThemedText type="smallBold" style={styles.infoValue}>
        {value}
      </ThemedText>
    </View>
  );
}

function EmptyText({ text }: { text: string }) {
  return (
    <ThemedText type="small" themeColor="textSecondary">
      {text}
    </ThemedText>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  grow: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.four,
  },
  breadcrumbBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.three,
    borderBottomWidth: 1,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: Spacing.two,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pageTitle: {
    fontSize: 18,
  },
  content: {
    padding: Spacing.four,
    gap: Spacing.four,
  },
  columns: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.four,
  },
  column: {
    flex: 1,
    minWidth: 340,
    gap: Spacing.four,
  },
  section: {
    borderWidth: 1,
    borderRadius: Spacing.three,
    padding: Spacing.four,
    gap: Spacing.three,
  },
  sectionLabel: {
    letterSpacing: 0.4,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: Spacing.three,
  },
  infoValue: {
    flexShrink: 1,
    textAlign: 'right',
  },
  link: {
    textDecorationLine: 'underline',
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    borderWidth: 1,
    borderRadius: Spacing.three,
    padding: Spacing.three,
  },
});
