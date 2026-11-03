import { useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";

import type { CreateRideInput } from "@/api/rides.api";
import { ThemedText } from "@/components/themed-text";
import { DaySelector } from "@/components/travel/day-selector";
import { MapLocationField } from "@/components/travel/map-location-field";
import { TimeField } from "@/components/travel/time-field";
import { Banner } from "@/components/ui/banner";
import { Button } from "@/components/ui/button";
import { TextField } from "@/components/ui/text-field";
import { SeatsField } from "@/components/vehicle/seats-field";
import { Spacing } from "@/constants/theme";
import { Weekday } from "@/constants/weekday.enum";
import { useTheme } from "@/hooks/use-theme";
import { useRideStore } from "@/stores/useRideStore";
import type { Ride } from "@/types/ride.types";
import type { GeoPoint } from "@/types/user.types";
import type { Vehicle } from "@/types/vehicle.types";
import { getErrorMessage } from "@/utils/errors";
import { nextOccurrence, timeOfDayFromISO } from "@/utils/schedule";

interface RideFormProps {
  vehicles: Vehicle[];
  // only set when editing
  ride?: Ride;
  onDone: () => void;
}

const MAX_COST = 100000;

export function RideForm({ vehicles, ride, onDone }: RideFormProps) {
  const theme = useTheme();
  const postRide = useRideStore((state) => state.postRide);
  const saveRide = useRideStore((state) => state.saveRide);

  const [origin, setOrigin] = useState<GeoPoint | undefined>(ride?.origin);
  const [destination, setDestination] = useState<GeoPoint | undefined>(
    ride?.destination,
  );
  const [time, setTime] = useState<string | undefined>(
    ride ? timeOfDayFromISO(ride.departureTime) : undefined,
  );
  const [days, setDays] = useState<Weekday[]>(ride?.daysOfWeek ?? []);
  const [seats, setSeats] = useState<number | undefined>(ride?.seatsAvailable);
  const [vehicleId, setVehicleId] = useState<string>(
    ride?.vehicleId ?? vehicles[0].id,
  );
  const [cost, setCost] = useState<string>(
    ride ? String(ride.costContribution) : "",
  );

  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const selectedVehicle = vehicles.find((v) => v.id === vehicleId);

  function handleVehicleChange(vehicle: Vehicle) {
    setVehicleId(vehicle.id);
    // the old seat count may not fit the new car
    if (seats !== undefined && seats > vehicle.seatsAvailable) {
      setSeats(undefined);
    }
  }

  function submitLabel(): string {
    if (isSaving) return ride ? "Saving…" : "Posting…";
    if (saveError) return "Try again";
    return ride ? "Save changes" : "Post a ride";
  }

  const costNum = Number(cost);
  const costOk =
    cost.trim().length > 0 &&
    Number.isFinite(costNum) &&
    costNum >= 0 &&
    costNum <= MAX_COST;
  const isValid =
    !!origin &&
    !!destination &&
    !!time &&
    days.length > 0 &&
    seats !== undefined &&
    costOk;

  async function handleSubmit() {
    if (!origin || !destination || !time || seats === undefined || !costOk) {
      return;
    }
    setSaveError(null);
    setIsSaving(true);
    const input: CreateRideInput = {
      vehicleId,
      origin,
      destination,
      departureTime: nextOccurrence(time, days).toISOString(),
      daysOfWeek: days,
      seatsAvailable: seats,
      costContribution: costNum,
    };
    try {
      if (ride) {
        await saveRide(ride.id, input);
      } else {
        await postRide(input);
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
      {saveError && (
        <Banner
          message={
            ride
              ? "Couldn't save your changes. Check your connection and try again."
              : "Couldn't post your ride. Check your connection and try again."
          }
        />
      )}

      <MapLocationField
        label="ORIGIN"
        kind="origin"
        point={origin}
        placeholder="Set pickup point"
        onChange={setOrigin}
      />
      <MapLocationField
        label="DESTINATION"
        kind="destination"
        point={destination}
        placeholder="Set drop-off point"
        onChange={setDestination}
      />

      <TimeField
        label="DEPARTURE TIME"
        value={time}
        onChange={setTime}
        placeholder="Select a time"
      />

      <View style={styles.section}>
        <ThemedText
          type="smallBold"
          themeColor="textSecondary"
          style={styles.sectionLabel}
        >
          DAYS
        </ThemedText>
        <DaySelector value={days} onChange={setDays} size="medium" />
      </View>

      {vehicles.length > 1 && (
        <View style={styles.section}>
          <ThemedText
            type="smallBold"
            themeColor="textSecondary"
            style={styles.sectionLabel}
          >
            VEHICLE
          </ThemedText>
          <View style={styles.vehicleRow}>
            {vehicles.map((vehicle) => {
              const selected = vehicle.id === vehicleId;
              return (
                <Pressable
                  key={vehicle.id}
                  accessibilityRole="radio"
                  accessibilityState={{ selected }}
                  onPress={() => handleVehicleChange(vehicle)}
                  style={[
                    styles.vehicleChip,
                    { borderColor: selected ? theme.primary : theme.border },
                    selected && { backgroundColor: theme.primarySoft },
                  ]}
                >
                  <ThemedText
                    type="smallBold"
                    themeColor={selected ? "primary" : "textSecondary"}
                  >
                    {vehicle.make} {vehicle.model} · {vehicle.plateNumber}
                  </ThemedText>
                </Pressable>
              );
            })}
          </View>
        </View>
      )}

      <SeatsField
        label="Seats available"
        value={seats}
        onChange={setSeats}
        max={selectedVehicle?.seatsAvailable}
      />

      <TextField
        label="Cost contribution per rider"
        placeholder="e.g. 400"
        value={cost}
        onChangeText={setCost}
        keyboardType="decimal-pad"
        helperText="This is a shared contribution toward fuel costs, split evenly with your riders."
      />

      <Button
        label={submitLabel()}
        onPress={handleSubmit}
        disabled={!isValid}
        loading={isSaving}
      />
    </>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: Spacing.two,
  },
  sectionLabel: {
    letterSpacing: 0.4,
  },
  vehicleRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.two,
  },
  vehicleChip: {
    borderWidth: 1.5,
    borderRadius: Spacing.three,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
  },
});
