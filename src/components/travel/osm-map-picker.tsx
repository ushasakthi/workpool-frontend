import { useMemo, useState } from 'react';
import { ActivityIndicator, Modal, Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WebView, type WebViewMessageEvent } from 'react-native-webview';

import { reverseGeocodeApproxLabel } from '@/api/geocode.api';
import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import type { GeoPoint } from '@/types/user.types';

import { labelledPinsScript } from './map-pins-script';

// default to Colombo
const DEFAULT_CENTER = { lat: 6.9271, lng: 79.8612 };

interface OsmMapPickerProps {
  visible: boolean;
  title: string;
  initialPoint?: GeoPoint;
  // shown for reference, can't be dragged
  labelledPins?: GeoPoint[];
  onCancel: () => void;
  onConfirm: (point: GeoPoint) => void;
}

function buildLeafletHtml(
  center: { lat: number; lng: number },
  hasInitial: boolean,
  pins: GeoPoint[],
  pinColor: string,
): string {
  return `<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <style>
    html, body, #map { height: 100%; margin: 0; padding: 0; }
    .leaflet-container { background: #e8eae6; }
  </style>
</head>
<body>
  <div id="map"></div>
  <script>
    var map = L.map('map', { zoomControl: true }).setView([${center.lat}, ${center.lng}], 14);
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);

    var marker = ${hasInitial ? `L.marker([${center.lat}, ${center.lng}], { draggable: true }).addTo(map)` : 'null'};

    function post(lat, lng) {
      var msg = JSON.stringify({ lat: lat, lng: lng });
      if (window.ReactNativeWebView) { window.ReactNativeWebView.postMessage(msg); }
      if (window.parent && window.parent !== window) { window.parent.postMessage(msg, '*'); }
    }

    function place(latlng) {
      if (marker) { marker.setLatLng(latlng); }
      else {
        marker = L.marker(latlng, { draggable: true }).addTo(map);
        marker.on('dragend', function () { var p = marker.getLatLng(); post(p.lat, p.lng); });
      }
      post(latlng.lat, latlng.lng);
    }

    map.on('click', function (e) { place(e.latlng); });
    if (marker) {
      marker.on('dragend', function () { var p = marker.getLatLng(); post(p.lat, p.lng); });
    }
    ${labelledPinsScript(pins, pinColor, hasInitial)}
  </script>
</body>
</html>`;
}

export function OsmMapPicker({
  visible,
  title,
  initialPoint,
  labelledPins = [],
  onCancel,
  onConfirm,
}: OsmMapPickerProps) {
  const theme = useTheme();
  const [selected, setSelected] = useState<{ lat: number; lng: number } | null>(
    initialPoint ? { lat: initialPoint.lat, lng: initialPoint.lng } : null,
  );
  const [isResolving, setIsResolving] = useState(false);

  const html = useMemo(
    () => buildLeafletHtml(initialPoint ?? DEFAULT_CENTER, Boolean(initialPoint), labelledPins, theme.primary),
    [initialPoint, labelledPins, theme.primary],
  );

  function handleMessage(event: WebViewMessageEvent) {
    try {
      const data = JSON.parse(event.nativeEvent.data) as { lat: number; lng: number };
      if (typeof data.lat === 'number' && typeof data.lng === 'number') {
        setSelected({ lat: data.lat, lng: data.lng });
      }
    } catch {
      // ignore malformed messages
    }
  }

  async function handleConfirm() {
    if (!selected) return;
    setIsResolving(true);
    const label = await reverseGeocodeApproxLabel(selected.lat, selected.lng);
    setIsResolving(false);
    onConfirm({
      lat: Number(selected.lat.toFixed(6)),
      lng: Number(selected.lng.toFixed(6)),
      label: label ?? `${selected.lat.toFixed(4)}, ${selected.lng.toFixed(4)}`,
    });
  }

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onCancel}>
      <SafeAreaView style={[styles.flex, { backgroundColor: theme.background }]} edges={['top', 'bottom']}>
        <View style={[styles.header, { borderBottomColor: theme.border }]}>
          <Pressable accessibilityRole="button" onPress={onCancel} hitSlop={8}>
            <ThemedText type="smallBold" themeColor="textSecondary">
              Cancel
            </ThemedText>
          </Pressable>
          <ThemedText type="smallBold">{title}</ThemedText>
          <View style={styles.headerSpacer} />
        </View>

        <View style={styles.flex}>
          <WebView
            originWhitelist={['*']}
            source={{ html }}
            onMessage={handleMessage}
            style={styles.flex}
            startInLoadingState
            renderLoading={() => (
              <View style={styles.loading}>
                <ActivityIndicator color={theme.primary} />
              </View>
            )}
          />
        </View>

        <View style={[styles.footer, { borderTopColor: theme.border }]}>
          <ThemedText type="small" themeColor="textSecondary" style={styles.hint}>
            {selected
              ? `Pin at ${selected.lat.toFixed(4)}, ${selected.lng.toFixed(4)}`
              : 'Tap the map to drop a pin on your area — an approximate point is enough.'}
          </ThemedText>
          <Button
            label="Use this location"
            onPress={handleConfirm}
            disabled={!selected}
            loading={isResolving}
          />
        </View>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.three,
    borderBottomWidth: 1,
  },
  headerSpacer: {
    width: 48,
  },
  loading: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footer: {
    padding: Spacing.four,
    gap: Spacing.three,
    borderTopWidth: 1,
  },
  hint: {
    textAlign: 'center',
  },
});
