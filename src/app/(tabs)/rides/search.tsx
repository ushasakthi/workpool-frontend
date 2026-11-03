import { useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { FilterTabs } from '@/components/admin/filter-tabs';
import { RidesSegment } from '@/components/rides/rides-segment';
import { ThemedText } from '@/components/themed-text';
import { TimeField } from '@/components/travel/time-field';
import { Button } from '@/components/ui/button';
import { Screen } from '@/components/ui/screen';
import { StateMessage } from '@/components/ui/state-message';
import { Spacing } from '@/constants/theme';
import { UserRole } from '@/constants/user-role.enum';
import { useTheme } from '@/hooks/use-theme';
import { useAuthStore } from '@/stores/useAuthStore';
import { useRideStore } from '@/stores/useRideStore';

const FLEX_TABS = [
  { value: '15', label: '±15' },
  { value: '30', label: '±30' },
  { value: '60', label: '±60 min' },
];

const WALK_TABS = [
  { value: '0.5', label: '500 m' },
  { value: '1', label: '1 km' },
  { value: '2', label: '2 km' },
];

export default function RideSearchScreen() {
  const router = useRouter();
  const travelProfile = useAuthStore((state) => state.user?.travelProfile);
  const role = useAuthStore((state) => state.user?.role);
  const filters = useRideStore((state) => state.searchFilters);
  const setSearchFilters = useRideStore((state) => state.setSearchFilters);

  const home = travelProfile?.homeLocation;
  const work = travelProfile?.workLocation;

  return (
    <Screen
      // passengers only search, "both" users switch between searching and driving
      header={role === UserRole.BOTH ? <RidesSegment active="search" /> : undefined}
      underTabBar>
      <View style={styles.heading}>
        <ThemedText type="title" style={styles.title}>
          Find a ride
        </ThemedText>
        <ThemedText themeColor="textSecondary">Your commute to work</ThemedText>
      </View>

      {/* the backend scores rides from your home location, so it's required */}
      {!home ? (
        <NoHomeState onSetUp={() => router.push('/profile/travel-profile')} />
      ) : (
        <>
          <RouteSummary from={home.label ?? 'Home'} to={work?.label ?? 'Work'} />

          <View style={styles.row}>
            <TimeField
              label="Leave around"
              value={filters.leaveAround}
              onChange={(value) => setSearchFilters({ ...filters, leaveAround: value })}
            />
          </View>

          <View style={styles.section}>
            <ThemedText type="small" themeColor="textSecondary">
              Flexible by
            </ThemedText>
            <FilterTabs
              tabs={FLEX_TABS}
              value={String(filters.flexMinutes)}
              onChange={(value) => setSearchFilters({ ...filters, flexMinutes: Number(value) })}
            />
          </View>

          <View style={styles.section}>
            <ThemedText type="smallBold">Max walk to pickup</ThemedText>
            <FilterTabs
              tabs={WALK_TABS}
              value={String(filters.maxWalkKm)}
              onChange={(value) => setSearchFilters({ ...filters, maxWalkKm: Number(value) })}
            />
          </View>

          <View style={styles.footer}>
            <Button
              label="Search rides"
              trailingArrow
              onPress={() => router.push('/rides/results')}
            />
            <ThemedText type="small" themeColor="textSecondary" style={styles.center}>
              Only verified professionals can offer rides
            </ThemedText>
          </View>
        </>
      )}
    </Screen>
  );
}

function RouteSummary({ from, to }: { from: string; to: string }) {
  const theme = useTheme();
  return (
    <View style={[styles.routeCard, { borderColor: theme.border }]}>
      <View style={styles.routeMarkers}>
        <View style={[styles.dot, { backgroundColor: theme.accent }]} />
        <View style={[styles.line, { borderColor: theme.accent }]} />
        <View style={[styles.square, { backgroundColor: theme.accent }]} />
      </View>
      <View style={styles.grow}>
        <ThemedText type="small" themeColor="textSecondary">
          From
        </ThemedText>
        <ThemedText numberOfLines={1}>{from}</ThemedText>
        <View style={[styles.divider, { backgroundColor: theme.border }]} />
        <ThemedText type="small" themeColor="textSecondary">
          To
        </ThemedText>
        <ThemedText numberOfLines={1}>{to}</ThemedText>
      </View>
    </View>
  );
}

function NoHomeState({ onSetUp }: { onSetUp: () => void }) {
  return (
    <StateMessage
      icon="mapPin"
      title="Set your home and work first"
      message="We match rides to your commute, so we need your travel profile."
      action={{ label: 'Set up travel profile', onPress: onSetUp }}
    />
  );
}

const styles = StyleSheet.create({
  heading: {
    gap: Spacing.one,
  },
  title: {
    fontSize: 32,
    lineHeight: 38,
  },
  row: {
    flexDirection: 'row',
  },
  section: {
    gap: Spacing.two,
  },
  footer: {
    gap: Spacing.three,
    paddingTop: Spacing.three,
  },
  center: {
    textAlign: 'center',
  },
  routeCard: {
    flexDirection: 'row',
    gap: Spacing.three,
    borderWidth: 1,
    borderRadius: Spacing.four,
    padding: Spacing.three,
  },
  routeMarkers: {
    alignItems: 'center',
    paddingVertical: Spacing.four,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  line: {
    flex: 1,
    borderLeftWidth: 1.5,
    borderStyle: 'dashed',
    marginVertical: Spacing.one,
  },
  square: {
    width: 10,
    height: 10,
    borderRadius: 2,
  },
  grow: {
    flex: 1,
  },
  divider: {
    height: 1,
    marginVertical: Spacing.two,
  },
});
