import type { ImageSource } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { useState } from 'react';

import type { VehiclePhotoFile } from '@/api/vehicles.api';
import { Banner } from '@/components/ui/banner';
import { Button } from '@/components/ui/button';
import { TextField } from '@/components/ui/text-field';
import { useApiImageSource } from '@/hooks/use-api-image';
import { useVehicleStore } from '@/stores/useVehicleStore';
import type { Vehicle } from '@/types/vehicle.types';
import { getErrorMessage } from '@/utils/errors';
import {
  ALLOWED_VEHICLE_PHOTO_MIME,
  isValidPlate,
  isValidVehicleYear,
  MAX_VEHICLE_PHOTO_BYTES,
  VEHICLE_YEAR_MIN,
  vehicleYearMax,
} from '@/utils/validators';

import { SeatsField } from './seats-field';
import { VehiclePhotoField } from './vehicle-photo-field';

interface VehicleFormProps {
  // only set when editing
  vehicle?: Vehicle;
  onDone: () => void;
}

export function VehicleForm({ vehicle, onDone }: VehicleFormProps) {
  const addVehicle = useVehicleStore((state) => state.addVehicle);
  const saveVehicle = useVehicleStore((state) => state.saveVehicle);
  const serverPhoto = useApiImageSource(vehicle?.photoUrl);

  const [make, setMake] = useState(vehicle?.make ?? '');
  const [model, setModel] = useState(vehicle?.model ?? '');
  const [year, setYear] = useState(vehicle ? String(vehicle.year) : '');
  const [plateNumber, setPlateNumber] = useState(vehicle?.plateNumber ?? '');
  const [seats, setSeats] = useState<number | undefined>(
    vehicle?.seatsAvailable,
  );
  const [pickedPhoto, setPickedPhoto] = useState<VehiclePhotoFile | null>(null);
  const [pickedSource, setPickedSource] = useState<ImageSource | undefined>(
    undefined,
  );

  const [showErrors, setShowErrors] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [photoError, setPhotoError] = useState<string | null>(null);

  const trimmedMake = make.trim();
  const trimmedModel = model.trim();
  const yearNum = Number(year);
  const makeOk = trimmedMake.length > 0;
  const modelOk = trimmedModel.length > 0;
  const yearOk = year.length > 0 && isValidVehicleYear(yearNum);
  const plateOk = isValidPlate(plateNumber);
  const seatsOk = seats !== undefined;
  const isValid = makeOk && modelOk && yearOk && plateOk && seatsOk;

  const errorFor = (ok: boolean, message: string) =>
    showErrors && !ok ? message : undefined;

  async function handlePickPhoto() {
    setPhotoError(null);
    const permission =
      await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      setPhotoError('Photo library access is required to choose a photo.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.8,
    });
    if (result.canceled) return;

    const asset = result.assets[0];
    const mimeType = asset.mimeType ?? 'image/jpeg';
    if (!ALLOWED_VEHICLE_PHOTO_MIME.includes(mimeType)) {
      setPhotoError('Photo must be a JPG, PNG, or WebP image.');
      return;
    }
    if (asset.fileSize && asset.fileSize > MAX_VEHICLE_PHOTO_BYTES) {
      setPhotoError('Photo must be 5MB or smaller.');
      return;
    }
    setPickedPhoto({
      uri: asset.uri,
      name: asset.fileName ?? `vehicle-${Date.now()}.jpg`,
      mimeType,
    });
    setPickedSource({ uri: asset.uri });
  }

  async function handleSave() {
    if (!isValid || seats === undefined) {
      setShowErrors(true);
      return;
    }
    setSaveError(null);
    setIsSaving(true);
    const input = {
      make: trimmedMake,
      model: trimmedModel,
      year: yearNum,
      plateNumber: plateNumber.trim().toUpperCase(),
      seatsAvailable: seats,
    };
    try {
      if (vehicle) {
        await saveVehicle(vehicle.id, input, pickedPhoto);
      } else {
        await addVehicle(input, pickedPhoto);
      }
      onDone();
    } catch (err) {
      setSaveError(getErrorMessage(err));
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <>
      {saveError && <Banner message={saveError} />}
      {photoError && <Banner message={photoError} />}

      <VehiclePhotoField
        label="Vehicle photo"
        source={pickedSource ?? serverPhoto}
        onPick={handlePickPhoto}
      />

      <TextField
        label="Make"
        placeholder="e.g. Toyota"
        value={make}
        onChangeText={setMake}
        autoCapitalize="words"
        error={errorFor(makeOk, 'Enter the make')}
      />
      <TextField
        label="Model"
        placeholder="e.g. Corolla"
        value={model}
        onChangeText={setModel}
        autoCapitalize="words"
        error={errorFor(modelOk, 'Enter the model')}
      />
      <TextField
        label="Year"
        placeholder="e.g. 2021"
        value={year}
        onChangeText={setYear}
        keyboardType="number-pad"
        maxLength={4}
        error={errorFor(
          yearOk,
          `Enter a year between ${VEHICLE_YEAR_MIN} and ${vehicleYearMax()}`,
        )}
      />
      <TextField
        label="Plate number"
        placeholder="e.g. WP-4821"
        value={plateNumber}
        onChangeText={setPlateNumber}
        autoCapitalize="characters"
        autoCorrect={false}
        helperText="Format: 2–3 letters, dash, 4 digits"
        error={errorFor(plateOk, 'Enter a valid plate number')}
      />
      <SeatsField
        label="Seats available"
        value={seats}
        onChange={setSeats}
        error={errorFor(seatsOk, 'Choose how many seats')}
      />

      <Button
        label={saveError ? 'Try again' : 'Save vehicle'}
        onPress={handleSave}
        loading={isSaving}
      />
    </>
  );
}
