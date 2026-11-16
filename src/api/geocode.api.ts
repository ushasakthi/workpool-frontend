import { apiClient } from './client';

interface SuccessResponse<T> {
  success: true;
  statusCode: number;
  data: T;
}

// Asks our backend, which asks OpenStreetMap. OpenStreetMap refuses requests
// straight from the phone, so the app never calls it directly.
// e.g. "Near Bambalapitiya, Colombo"; null if it fails.
export async function reverseGeocodeApproxLabel(
  lat: number,
  lng: number,
): Promise<string | null> {
  try {
    const response = await apiClient.get<SuccessResponse<{ label: string | null }>>(
      '/geocode/reverse',
      { params: { lat, lng } },
    );
    return response.data.data.label;
  } catch {
    return null;
  }
}
