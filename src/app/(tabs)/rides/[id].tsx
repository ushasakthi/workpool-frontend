import { useLocalSearchParams } from 'expo-router';

import { PlaceholderScreen } from '@/components/ui/placeholder-screen';

export default function RideDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <PlaceholderScreen title="Ride Detail" description={`Ride #${id}`} />;
}
