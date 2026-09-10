import { Image } from 'expo-image';
import { SymbolView } from 'expo-symbols';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { StatusPill } from '@/components/ui/status-pill';
import { Icons } from '@/constants/icons';
import { Spacing } from '@/constants/theme';
import { useApiImageSource } from '@/hooks/use-api-image';
import { useTheme } from '@/hooks/use-theme';
import type { Vehicle } from '@/types/vehicle.types';

interface VehicleCardProps {
  vehicle: Vehicle;
  onEdit: () => void;
  onToggleActive: () => void;
  /** A status toggle for this card is in flight. */
  busy?: boolean;
}

export function VehicleCard({
  vehicle,
  onEdit,
  onToggleActive,
  busy = false,
}: VehicleCardProps) {
  const theme = useTheme();
  const photo = useApiImageSource(vehicle.photoUrl);

  const name = `${vehicle.make} ${vehicle.model}`;
  const seats = `${vehicle.seatsAvailable} seat${
    vehicle.seatsAvailable === 1 ? '' : 's'
  } available`;

  return (
    <View style={[styles.card, { borderColor: theme.border }]}>
      <View style={styles.body}>
        <View
          style={[
            styles.thumb,
            {
              backgroundColor: theme.backgroundElement,
              borderColor: theme.border,
            },
          ]}>
          {photo ? (
            <Image
              source={photo}
              style={styles.thumbImage}
              contentFit="cover"
            />
          ) : (
            <SymbolView
              name={Icons.car}
              size={22}
              tintColor={theme.textSecondary}
            />
          )}
        </View>

        <View style={styles.info}>
          <ThemedText type="smallBold">
            {name} ({vehicle.year})
          </ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            Plate {vehicle.plateNumber} · {seats}
          </ThemedText>
        </View>

        <StatusPill
          label={vehicle.isActive ? 'Active' : 'Inactive'}
          tone={vehicle.isActive ? 'primary' : 'neutral'}
        />
      </View>

      <View style={[styles.divider, { backgroundColor: theme.border }]} />

      <View style={styles.footer}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={
            vehicle.isActive
              ? `Set ${name} inactive`
              : `Set ${name} active`
          }
          accessibilityState={{ disabled: busy, busy }}
          onPress={busy ? undefined : onToggleActive}
          style={[
            styles.footerAction,
            { backgroundColor: theme.backgroundElement },
          ]}>
          {busy ? (
            <ActivityIndicator size="small" color={theme.textSecondary} />
          ) : (
            <SymbolView
              name={vehicle.isActive ? Icons.pause : Icons.check}
              size={15}
              tintColor={theme.textSecondary}
            />
          )}
          <ThemedText type="smallBold" themeColor="textSecondary">
            {vehicle.isActive ? 'Set inactive' : 'Set active'}
          </ThemedText>
        </Pressable>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Edit ${name}`}
          onPress={onEdit}
          style={[
            styles.footerAction,
            { backgroundColor: theme.backgroundElement },
          ]}>
          <SymbolView
            name={Icons.pencil}
            size={15}
            tintColor={theme.primary}
          />
          <ThemedText type="smallBold" themeColor="primary">
            Edit
          </ThemedText>
        </Pressable>
      </View>
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
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    padding: Spacing.three,
  },
  thumb: {
    width: 56,
    height: 56,
    borderRadius: Spacing.two,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  thumbImage: {
    width: '100%',
    height: '100%',
  },
  info: {
    flex: 1,
    gap: Spacing.half,
  },
  divider: {
    height: 1,
    marginHorizontal: Spacing.three,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: Spacing.two,
    padding: Spacing.three,
  },
  footerAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: Spacing.two,
  },
});
