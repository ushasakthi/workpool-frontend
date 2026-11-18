import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { LiveDot } from '@/components/trip/live-dot';
import { NextStopCard } from '@/components/trip/next-stop-card';
import { ProgressBar } from '@/components/trip/progress-bar';
import { StopList } from '@/components/trip/stop-list';
import { Banner } from '@/components/ui/banner';
import { Button } from '@/components/ui/button';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import type { DriverTrip } from '@/types/trip.types';
import { formatClockTime } from '@/utils/formatters';
import { nextDropOff, nextStop, pickedUpCount } from '@/utils/trip';

interface DriverTripViewProps {
  trip: DriverTrip;
  // set when the last refresh failed; the last known stops stay on screen
  offlineError: string | null;
  updatedAt: Date | null;
  onRetry: () => void;
  onEnterPin: (bookingId: string) => void;
  droppingOffId: string | null;
  dropOffError: string | null;
  onDropOff: (bookingId: string) => void;
  onFinish: () => void;
}

export function DriverTripView({
  trip,
  offlineError,
  updatedAt,
  onRetry,
  onEnterPin,
  droppingOffId,
  dropOffError,
  onDropOff,
  onFinish,
}: DriverTripViewProps) {
  const theme = useTheme();
  const picked = pickedUpCount(trip);
  const total = trip.stops.length;
  const onBoard = trip.stops.filter((stop) => stop.pickedUpAt && !stop.droppedOffAt).length;
  const endLabel = trip.destination.label ?? 'Destination';

  return (
    <>
      {offlineError && (
        <View style={styles.offline}>
          <View style={styles.grow}>
            <Banner message="Couldn’t update the trip. Check your connection." icon="wifiSlash" />
          </View>
          <Button label="Retry" variant="text" onPress={onRetry} />
        </View>
      )}

      <View style={styles.summary}>
        <View style={styles.row}>
          <LiveDot color={offlineError ? theme.textSecondary : theme.primary} />
          <ThemedText type="smallBold" themeColor={offlineError ? 'textSecondary' : 'primary'}>
            {offlineError && updatedAt
              ? `Last updated ${formatClockTime(updatedAt.toISOString())}`
              : `Live · started ${formatClockTime(trip.startedAt)}`}
          </ThemedText>
        </View>
        <ThemedText style={styles.route}>
          {trip.origin.label ?? 'Start'} → {endLabel}
        </ThemedText>
        <View style={styles.row}>
          <ThemedText type="smallBold" themeColor="textSecondary">
            {picked} of {total} picked up
          </ThemedText>
          <View style={styles.grow}>
            <ProgressBar
              value={total === 0 ? 1 : picked / total}
              color={theme.primary}
              trackColor={theme.backgroundElement}
            />
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <ThemedText type="smallBold" themeColor="textSecondary" style={styles.label}>
          NEXT STOP
        </ThemedText>
        <NextStopCard
          stop={nextStop(trip)}
          dropOff={nextDropOff(trip)}
          endLabel={endLabel}
          ridersOnBoard={onBoard}
          onEnterPin={onEnterPin}
          droppingOffId={droppingOffId}
          onDropOff={onDropOff}
        />
      </View>

      <View style={styles.section}>
        <ThemedText type="smallBold" themeColor="textSecondary" style={styles.label}>
          ALL STOPS
        </ThemedText>
        {dropOffError && (
          <ThemedText type="small" themeColor="error">
            {dropOffError}
          </ThemedText>
        )}
        <StopList
          stops={trip.stops}
          endLabel={endLabel}
          droppingOffId={droppingOffId}
          onDropOff={onDropOff}
        />
      </View>

      {/* soft until everyone is on board, so it doesn't look like the next step */}
      <Button
        label="Finish trip"
        icon={picked === total ? 'check' : undefined}
        variant={picked === total ? 'primary' : 'soft'}
        onPress={onFinish}
      />
    </>
  );
}

const styles = StyleSheet.create({
  offline: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  summary: {
    gap: Spacing.two,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
  },
  grow: {
    flex: 1,
  },
  route: {
    fontSize: 20,
    lineHeight: 26,
    fontWeight: 800,
  },
  section: {
    gap: Spacing.two,
  },
  label: {
    fontSize: 12,
    letterSpacing: 0.7,
  },
});
