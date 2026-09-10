import { Stack } from 'expo-router';

export default function RidesLayout() {
  return <Stack initialRouteName="my-rides" screenOptions={{ headerShown: false }} />;
}
