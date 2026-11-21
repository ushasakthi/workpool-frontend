import { Image } from 'expo-image';
import { SymbolView } from 'expo-symbols';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { StatusPill } from '@/components/ui/status-pill';
import { Icons } from '@/constants/icons';
import { Spacing } from '@/constants/theme';
import { useApiImageSource } from '@/hooks/use-api-image';
import { useTheme } from '@/hooks/use-theme';
import type { Vehicle } from '@/types/vehicle.types';

const MAX_SHOWN = 3;

interface VehicleSummaryCardProps {
  vehicles: Vehicle[];
  error: string | null;
  onAdd: () => void;
  onOpen: (vehicle: Vehicle) => void;
  onSeeAll: () => void;
  onRetry: () => void;
}

export function VehicleSummaryCard({
  vehicles,
  error,
  onAdd,
  onOpen,
  onSeeAll,
  onRetry,
}: VehicleSummaryCardProps) {
  const theme = useTheme();
  const allPaused = vehicles.length > 0 && vehicles.every((vehicle) => !vehicle.isActive);
  const shown = vehicles.slice(0, MAX_SHOWN);

  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Pressable accessibilityRole="button" onPress={onSeeAll} hitSlop={8}>
          <ThemedText type="smallBold" themeColor="textSecondary" style={styles.sectionLabel}>
            VEHICLES
          </ThemedText>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Add vehicle"
          onPress={onAdd}
          style={[styles.addButton, { backgroundColor: theme.primary }]}>
          <SymbolView name={Icons.add} size={18} tintColor={theme.onPrimary} />
        </Pressable>
      </View>

      {!error && allPaused && (
        <View style={[styles.warning, { backgroundColor: theme.warningSoft }]}>
          <SymbolView name={Icons.warningTriangle} size={18} tintColor={theme.warning} />
          <ThemedText type="smallBold" themeColor="warning" style={styles.grow}>
            All vehicles are paused — you can&apos;t post rides
          </ThemedText>
        </View>
      )}

      {error ? (
        <View style={[styles.card, styles.empty, { backgroundColor: theme.backgroundElement }]}>
          <SymbolView name={Icons.wifiSlash} size={26} tintColor={theme.textSecondary} />
          <ThemedText type="smallBold" style={styles.emptyTitle}>
            Couldn&apos;t load vehicles
          </ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            {error}
          </ThemedText>
          <Button label="Try again" variant="soft" onPress={onRetry} />
        </View>
      ) : vehicles.length === 0 ? (
        <View style={[styles.card, styles.empty, { backgroundColor: theme.backgroundElement }]}>
          <SymbolView name={Icons.car} size={26} tintColor={theme.textSecondary} />
          <ThemedText type="smallBold" style={styles.emptyTitle}>
            No vehicle yet
          </ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            Add one to offer rides.
          </ThemedText>
          <Button label="Add vehicle" variant="soft" onPress={onAdd} />
        </View>
      ) : (
        <View style={[styles.card, { backgroundColor: theme.backgroundElement }]}>
          {shown.map((vehicle, index) => (
            <VehicleRow
              key={vehicle.id}
              vehicle={vehicle}
              first={index === 0}
              onPress={() => onOpen(vehicle)}
            />
          ))}
          {vehicles.length > MAX_SHOWN && (
            <Pressable
              accessibilityRole="button"
              onPress={onSeeAll}
              style={[styles.seeAll, { borderTopColor: theme.border }]}>
              <ThemedText type="smallBold" themeColor="primary">
                See all ({vehicles.length})
              </ThemedText>
            </Pressable>
          )}
        </View>
      )}
    </View>
  );
}

// own component so each row can call the photo hook
function VehicleRow({
  vehicle,
  first,
  onPress,
}: {
  vehicle: Vehicle;
  first: boolean;
  onPress: () => void;
}) {
  const theme = useTheme();
  const photo = useApiImageSource(vehicle.photoUrl);

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={[styles.row, !first && { borderTopWidth: 1, borderTopColor: theme.border }]}>
      <View style={[styles.thumb, { backgroundColor: theme.background }]}>
        {photo?.uri ? (
          <Image source={photo} style={styles.thumbImage} contentFit="cover" />
        ) : (
          <SymbolView name={Icons.car} size={22} tintColor={theme.textSecondary} />
        )}
      </View>
      <View style={styles.grow}>
        <ThemedText type="smallBold" style={styles.name} numberOfLines={1}>
          {vehicle.make} {vehicle.model} · {vehicle.year}
        </ThemedText>
        <ThemedText type="small" themeColor="textSecondary">
          {vehicle.plateNumber} · {vehicle.seatsAvailable} seat{vehicle.seatsAvailable === 1 ? '' : 's'}
        </ThemedText>
      </View>
      {vehicle.isActive ? (
        <StatusPill tone="primary" icon="check" label="Active" />
      ) : (
        <StatusPill tone="warning" icon="pause" label="Paused" />
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: Spacing.two,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionLabel: {
    fontSize: 12,
    letterSpacing: 0.7,
  },
  addButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  warning: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 11,
  },
  card: {
    borderRadius: Spacing.three,
  },
  empty: {
    alignItems: 'center',
    gap: 6,
    paddingVertical: 22,
    paddingHorizontal: Spacing.three,
  },
  emptyTitle: {
    fontSize: 16,
    marginTop: 2,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  seeAll: {
    alignItems: 'center',
    borderTopWidth: 1,
    paddingVertical: 12,
  },
  thumb: {
    width: 44,
    height: 44,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  thumbImage: {
    width: '100%',
    height: '100%',
  },
  grow: {
    flex: 1,
  },
  name: {
    fontSize: 15,
  },
});
