import type { GeoPoint } from '@/types/user.types';

// Leaflet code for fixed, labelled pins (e.g. the user's Home and Work).
// Used inside the map HTML of both osm-map-picker files.
export function labelledPinsScript(pins: GeoPoint[], color: string, hasInitial: boolean): string {
  return `
    var pins = ${JSON.stringify(pins)};
    pins.forEach(function (p) {
      L.circleMarker([p.lat, p.lng], {
        radius: 8, color: '#ffffff', weight: 2, fillColor: '${color}', fillOpacity: 1
      }).addTo(map).bindTooltip(p.label, { permanent: true, direction: 'top', offset: [0, -8] });
    });
    // nothing picked yet: start zoomed to show the pins
    if (!${hasInitial} && pins.length > 0) {
      map.fitBounds(pins.map(function (p) { return [p.lat, p.lng]; }), { padding: [60, 60], maxZoom: 14 });
    }
  `;
}
