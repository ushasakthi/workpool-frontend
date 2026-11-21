import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { MapLocationField } from '@/components/travel/map-location-field';
import { Button } from '@/components/ui/button';
import { Spacing } from '@/constants/theme';
import type { GeoPoint } from '@/types/user.types';

const MAX_PLACES = 3;

interface PassingThroughFieldProps {
  value: GeoPoint[];
  onChange: (places: GeoPoint[]) => void;
  labelledPins?: GeoPoint[];
}

// "Passing through" on the ride form: up to 3 places, in driving order
export function PassingThroughField({ value, onChange, labelledPins }: PassingThroughFieldProps) {
  // true while an empty field is open for picking the next place
  const [adding, setAdding] = useState(false);

  function replace(index: number, place: GeoPoint) {
    onChange(value.map((current, i) => (i === index ? place : current)));
  }

  return (
    <View style={styles.section}>
      {value.map((place, index) => (
        <View key={index} style={styles.place}>
          <MapLocationField
            label={`PASSING THROUGH ${index + 1}`}
            kind="origin"
            point={place}
            labelledPins={labelledPins}
            onChange={(picked) => replace(index, picked)}
          />
          <Button
            label="Remove"
            variant="text"
            onPress={() => onChange(value.filter((_, i) => i !== index))}
          />
        </View>
      ))}

      {adding && (
        <MapLocationField
          label={`PASSING THROUGH ${value.length + 1}`}
          kind="origin"
          placeholder="Pick a place you pass through"
          labelledPins={labelledPins}
          onChange={(picked) => {
            onChange([...value, picked]);
            setAdding(false);
          }}
        />
      )}

      {!adding && value.length < MAX_PLACES && (
        <Button label="Add a place you pass through" variant="text" icon="add" onPress={() => setAdding(true)} />
      )}

      <ThemedText type="small" themeColor="textSecondary">
        {value.length === 0
          ? 'Add places you pass through so coworkers on your way can find you.'
          : value.length === MAX_PLACES
            ? 'Up to 3 places. Passengers near this route can find your ride.'
            : 'Passengers near this route can find your ride.'}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: Spacing.two,
  },
  place: {
    gap: Spacing.one,
  },
});
