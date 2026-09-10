// Reverse geocoding via OpenStreetMap's Nominatim — a public service, NOT our backend,
// so it uses a plain fetch rather than the authenticated apiClient. Best-effort: callers
// must handle a null result (offline, rate-limited, or no match) and fall back to
// showing raw coordinates.
const NOMINATIM_REVERSE_URL = 'https://nominatim.openstreetmap.org/reverse';
const REQUEST_TIMEOUT_MS = 6000;

interface NominatimAddress {
  neighbourhood?: string;
  suburb?: string;
  quarter?: string;
  city_district?: string;
  city?: string;
  town?: string;
  village?: string;
  municipality?: string;
  state?: string;
}

interface NominatimReverseResponse {
  address?: NominatimAddress;
}

// "Near Mission District, San Francisco" — an approximate area label, never a street address.
export async function reverseGeocodeApproxLabel(
  lat: number,
  lng: number,
): Promise<string | null> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const url = `${NOMINATIM_REVERSE_URL}?format=json&zoom=14&lat=${lat}&lon=${lng}`;
    const response = await fetch(url, {
      headers: { Accept: 'application/json' },
      signal: controller.signal,
    });
    if (!response.ok) return null;

    const data = (await response.json()) as NominatimReverseResponse;
    const address = data.address;
    if (!address) return null;

    const area =
      address.neighbourhood ??
      address.suburb ??
      address.quarter ??
      address.city_district;
    const place =
      address.city ?? address.town ?? address.village ?? address.municipality ?? address.state;

    if (area && place) return `Near ${area}, ${place}`;
    if (place) return `Near ${place}`;
    if (area) return `Near ${area}`;
    return null;
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}
