import { Stack } from 'expo-router';

export default function RidesLayout() {
  return <Stack initialRouteName="search" screenOptions={{ headerShown: false }} />;
}
