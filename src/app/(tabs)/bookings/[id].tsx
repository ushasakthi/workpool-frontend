import { useLocalSearchParams } from 'expo-router';

import { PlaceholderScreen } from '@/components/ui/placeholder-screen';

export default function BookingDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <PlaceholderScreen title="Booking Detail" description={`Booking #${id}`} />;
}
