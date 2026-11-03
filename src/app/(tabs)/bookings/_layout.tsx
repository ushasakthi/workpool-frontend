import { Stack } from 'expo-router';
import { Platform } from 'react-native';

// on web the top tab bar would cover a modal, so use a normal screen there
const modal = { presentation: Platform.OS === 'web' ? 'card' : 'modal' } as const;

export default function BookingsLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="review" options={modal} />
      <Stack.Screen name="report" options={modal} />
      <Stack.Screen name="verify-pickup" options={modal} />
    </Stack>
  );
}
