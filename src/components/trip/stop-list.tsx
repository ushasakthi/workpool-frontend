import { SymbolView } from 'expo-symbols';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { Icons } from '@/constants/icons';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import type { TripStop } from '@/types/trip.types';
import { formatClockTime } from '@/utils/formatters';

interface StopListProps {
  stops: TripStop[];
  dropOffLabel: string;
  droppingOffId: string | null;
  onDropOff: (bookingId: string) => void;
}

// every stop with its state: picked up ✓, next ●, waiting ○, then the drop-off ⚑
export function StopList({ stops, dropOffLabel, droppingOffId, onDropOff }: StopListProps) {
  const theme = useTheme();
  const nextIndex = stops.findIndex((stop) => !stop.pickedUpAt);
  const allOnBoard = nextIndex === -1;

  return (
    <View>
      {stops.map((stop, index) => {
        const isNext = index === nextIndex;
        return (
          <View key={stop.bookingId} style={styles.row}>
            <View style={styles.icon}>
              {stop.pickedUpAt ? (
                <SymbolView name={Icons.checkCircle} size={20} tintColor={theme.primary} />
              ) : (
                <View
                  style={[
                    styles.dot,
                    isNext
                      ? { backgroundColor: theme.primary }
                      : { borderWidth: 2, borderColor: theme.textSecondary },
                  ]}
                />
              )}
            </View>
            <ThemedText type="smallBold" themeColor="textSecondary" style={styles.number}>
              {index + 1}
            </ThemedText>
            <ThemedText
              type={isNext ? 'smallBold' : 'small'}
              themeColor={stop.pickedUpAt || isNext ? 'text' : 'textSecondary'}
              style={styles.grow}>
              {stop.passenger.name}
            </ThemedText>
            {stop.droppedOffAt ? (
              <ThemedText type="small" themeColor="textSecondary">
                Dropped off {formatClockTime(stop.droppedOffAt)}
              </ThemedText>
            ) : stop.pickedUpAt ? (
              <Button
                label="Drop off"
                variant="text"
                loading={droppingOffId === stop.bookingId}
                onPress={() => onDropOff(stop.bookingId)}
              />
            ) : isNext ? (
              <NextPill />
            ) : (
              <ThemedText type="small" themeColor="textSecondary">
                Waiting
              </ThemedText>
            )}
          </View>
        );
      })}

      <View style={[styles.row, styles.dropOff, { borderTopColor: theme.border }]}>
        <View style={styles.icon}>
          <SymbolView name={Icons.flag} size={18} tintColor={theme.accent} />
        </View>
        <View style={styles.number} />
        <ThemedText type="smallBold" style={styles.grow}>
          {dropOffLabel}
        </ThemedText>
        {allOnBoard ? (
          <NextPill />
        ) : (
          <ThemedText type="small" themeColor="textSecondary">
            Drop-off
          </ThemedText>
        )}
      </View>
    </View>
  );
}

function NextPill() {
  const theme = useTheme();
  return (
    <View style={[styles.pill, { backgroundColor: theme.primarySoft }]}>
      <ThemedText type="smallBold" themeColor="primarySoftText">
        Next
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    minHeight: 44,
  },
  dropOff: {
    borderTopWidth: 1,
  },
  icon: {
    width: 20,
    alignItems: 'center',
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  number: {
    width: 12,
  },
  grow: {
    flex: 1,
  },
  pill: {
    paddingHorizontal: Spacing.two,
    paddingVertical: 2,
    borderRadius: 999,
  },
});
