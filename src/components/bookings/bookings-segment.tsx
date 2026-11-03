import { useRouter } from 'expo-router';

import { FilterTabs } from '@/components/admin/filter-tabs';

type BookingsTab = 'mine' | 'requests';

const TABS: { value: BookingsTab; label: string }[] = [
  { value: 'mine', label: 'My bookings' },
  { value: 'requests', label: 'Ride requests' },
];

// only shown to "both" users, who book rides and also drive
export function BookingsSegment({ active }: { active: BookingsTab }) {
  const router = useRouter();
  return (
    <FilterTabs
      tabs={TABS}
      value={active}
      onChange={(tab) => router.replace(tab === 'mine' ? '/bookings' : '/bookings/requests')}
    />
  );
}
