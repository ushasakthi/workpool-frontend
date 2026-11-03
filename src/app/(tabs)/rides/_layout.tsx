import { Stack } from 'expo-router';
import { Platform } from 'react-native';

export default function RidesLayout() {
  return (
    <Stack initialRouteName="my-rides" screenOptions={{ headerShown: false }}>
      {/* slides up over the ride detail on phones; on web the top tab bar would cover a modal */}
      <Stack.Screen
        name="request"
        options={{ presentation: Platform.OS === 'web' ? 'card' : 'modal' }}
      />
    </Stack>
  );
}
