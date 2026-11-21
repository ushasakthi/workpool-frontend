// Sri Lankan plate, same as backend PLATE_NUMBER_REGEX
// e.g. "CAB-1234", "WP CAB-1234", "251-1234"
export const PLATE_NUMBER_REGEX = /^(?:[A-Z]{2,3}\s)?(?:[A-Z]{2,3}|\d{2,3})-\d{4}$/i;

export function isValidPlate(value: string): boolean {
  return PLATE_NUMBER_REGEX.test(value.trim());
}

// Backend CreateVehicleDto bounds: @Min(1980) @Max(currentYear + 1).
export const VEHICLE_YEAR_MIN = 1980;
export const vehicleYearMax = (): number => new Date().getFullYear() + 1;

export function isValidVehicleYear(value: number): boolean {
  return (
    Number.isInteger(value) &&
    value >= VEHICLE_YEAR_MIN &&
    value <= vehicleYearMax()
  );
}

// same limits as the backend image upload (jpg/png/webp, 5 MB)
export const MAX_VEHICLE_PHOTO_BYTES = 5 * 1024 * 1024;
export const ALLOWED_VEHICLE_PHOTO_MIME = [
  'image/jpeg',
  'image/png',
  'image/webp',
];
