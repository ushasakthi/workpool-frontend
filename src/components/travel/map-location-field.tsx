import { Image } from 'expo-image';
import { SymbolView } from 'expo-symbols';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Icons } from '@/constants/icons';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import type { GeoPoint } from '@/types/user.types';

import { OsmMapPicker } from './osm-map-picker';

interface MapLocationFieldProps {
  label: string;
  kind: 'home' | 'work' | 'origin' | 'destination';
  point?: GeoPoint;
  onChange: (point: GeoPoint) => void;
  // shown before a point is picked
  placeholder?: string;
}

// Green marker for the "start" end (home / origin), amber for the "destination" end.
const GREEN_KINDS = new Set(['home', 'origin']);

const PREVIEW_ZOOM = 14;

// map tile around the point, just a rough preview
function tileUrl(lat: number, lng: number): string {
  const n = 2 ** PREVIEW_ZOOM;
  const x = Math.floor(((lng + 180) / 360) * n);
  const latRad = (lat * Math.PI) / 180;
  const y = Math.floor(
    ((1 - Math.asinh(Math.tan(latRad)) / Math.PI) / 2) * n,
  );
  return `https://tile.openstreetmap.org/${PREVIEW_ZOOM}/${x}/${y}.png`;
}

export function MapLocationField({
  label,
  kind,
  point,
  onChange,
  placeholder,
}: MapLocationFieldProps) {
  const theme = useTheme();
  const [isPickerOpen, setIsPickerOpen] = useState(false);

  const tint = GREEN_KINDS.has(kind) ? theme.primary : theme.warning;
  const caption = point?.label ?? placeholder ?? `Set ${kind} location`;

  return (
    <View style={styles.container}>
      <ThemedText type="smallBold" themeColor="textSecondary" style={styles.label}>
        {label}
      </ThemedText>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Choose ${kind} location on the map`}
        onPress={() => setIsPickerOpen(true)}
        style={[styles.card, { borderColor: theme.border, backgroundColor: theme.backgroundElement }]}>
        {point && (
          <Image source={{ uri: tileUrl(point.lat, point.lng) }} style={styles.tile} contentFit="cover" />
        )}
        <View style={[styles.ring, { borderColor: tint }]} />
        <SymbolView name={Icons.mapPin} size={22} tintColor={tint} />
        <ThemedText type="small" themeColor="textSecondary" style={styles.mapLabel}>
          OpenStreetMap · {kind} area
        </ThemedText>
        <View style={[styles.attribution, { backgroundColor: theme.background }]}>
          <ThemedText type="small" themeColor="textSecondary" style={styles.attributionText}>
            © OpenStreetMap
          </ThemedText>
        </View>
      </Pressable>

      <View style={styles.captionRow}>
        <ThemedText type="small" themeColor={point ? 'text' : 'textSecondary'} style={styles.caption}>
          {caption}
        </ThemedText>
        <Pressable accessibilityRole="button" onPress={() => setIsPickerOpen(true)} hitSlop={8}>
          <ThemedText type="smallBold" themeColor="primary">
            {point ? 'Change' : 'Set location'}
          </ThemedText>
        </Pressable>
      </View>

      <OsmMapPicker
        visible={isPickerOpen}
        title={`${label[0]}${label.slice(1).toLowerCase()}`}
        initialPoint={point}
        onCancel={() => setIsPickerOpen(false)}
        onConfirm={(next) => {
          setIsPickerOpen(false);
          onChange(next);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.two,
  },
  label: {
    letterSpacing: 0.4,
  },
  card: {
    height: 128,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderRadius: Spacing.three,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.one,
    overflow: 'hidden',
  },
  tile: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.55,
  },
  ring: {
    position: 'absolute',
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    opacity: 0.5,
  },
  mapLabel: {
    fontWeight: '600',
  },
  attribution: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    paddingHorizontal: Spacing.two,
    paddingVertical: 1,
    borderTopLeftRadius: Spacing.two,
  },
  attributionText: {
    fontSize: 11,
  },
  captionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.two,
  },
  caption: {
    flex: 1,
  },
});
