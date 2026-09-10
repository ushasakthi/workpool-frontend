import { SymbolView } from 'expo-symbols';
import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { StatusPill } from '@/components/ui/status-pill';
import { Icons } from '@/constants/icons';
import { RideStatus } from '@/constants/ride-status.enum';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import type { Ride } from '@/types/ride.types';
import { formatRideSchedule } from '@/utils/schedule';

interface RideCardProps {
  ride: Ride;
  /** Footer content — rendered below a divider. Omit for a bare info card. */
  children?: ReactNode;
}

const STATUS_LABEL: Record<RideStatus, string> = {
  [RideStatus.ACTIVE]: 'Active',
  [RideStatus.PAUSED]: 'Paused',
  [RideStatus.CANCELLED]: 'Cancelled',
};

function seatsText(seats: number): string {
  if (seats <= 0) return 'Full';
  return `${seats} seat${seats === 1 ? '' : 's'} open`;
}

// Route + schedule + seats + status. Reused by "My rides" (with owner-action
// footer) and Sprint 4's search results.
export function RideCard({ ride, children }: RideCardProps) {
  const theme = useTheme();

  return (
    <View style={[styles.card, { borderColor: theme.border }]}>
      <View style={styles.body}>
        <View style={styles.headerRow}>
          <ThemedText type="smallBold" style={styles.grow} numberOfLines={1}>
            {ride.origin.label ?? 'Origin'}
          </ThemedText>
          <StatusPill
            label={STATUS_LABEL[ride.status]}
            tone={ride.status === RideStatus.ACTIVE ? 'primary' : 'neutral'}
          />
        </View>

        <View style={styles.destRow}>
          <SymbolView
            name={Icons.arrowDown}
            size={14}
            tintColor={theme.textSecondary}
          />
          <ThemedText
            type="small"
            themeColor="textSecondary"
            style={styles.grow}
            numberOfLines={1}>
            {ride.destination.label ?? 'Destination'}
          </ThemedText>
        </View>

        <View style={styles.metaRow}>
          <View style={styles.metaItem}>
            <SymbolView
              name={Icons.clock}
              size={14}
              tintColor={theme.textSecondary}
            />
            <ThemedText type="small" themeColor="textSecondary">
              {formatRideSchedule(ride.daysOfWeek, ride.departureTime)}
            </ThemedText>
          </View>
          <View style={styles.metaItem}>
            <SymbolView
              name={Icons.people}
              size={14}
              tintColor={theme.textSecondary}
            />
            <ThemedText type="small" themeColor="textSecondary">
              {seatsText(ride.seatsAvailable)}
            </ThemedText>
          </View>
        </View>
      </View>

      {children != null && (
        <>
          <View style={[styles.divider, { backgroundColor: theme.border }]} />
          <View style={styles.footer}>{children}</View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: Spacing.three,
    overflow: 'hidden',
  },
  body: {
    padding: Spacing.three,
    gap: Spacing.two,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.two,
  },
  grow: {
    flex: 1,
  },
  destRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
    columnGap: Spacing.four,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
  },
  divider: {
    height: 1,
    marginHorizontal: Spacing.three,
  },
  footer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: Spacing.two,
    padding: Spacing.three,
  },
});
