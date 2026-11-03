import { useRouter } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { SignalBars } from '@/components/rides/matching-score-badge';
import { RideResultCard } from '@/components/rides/ride-result-card';
import { ThemedText } from '@/components/themed-text';
import { Banner } from '@/components/ui/banner';
import { Button } from '@/components/ui/button';
import { Screen } from '@/components/ui/screen';
import { Skeleton } from '@/components/ui/skeleton';
import { StateMessage } from '@/components/ui/state-message';
import { Icons } from '@/constants/icons';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useRideStore, type SearchFilters } from '@/stores/useRideStore';
import { getErrorMessage } from '@/utils/errors';
import { formatDistance } from '@/utils/formatters';
import { formatHhMmForDisplay } from '@/utils/time';

const WIDEST_FLEX_MINUTES = 60;
const WIDEST_WALK_KM = 2;

export default function RideResultsScreen() {
  const router = useRouter();
  const filters = useRideStore((state) => state.searchFilters);
  const results = useRideStore((state) => state.searchResults);
  const search = useRideStore((state) => state.search);
  const setSearchFilters = useRideStore((state) => state.setSearchFilters);
  const loadMoreResults = useRideStore((state) => state.loadMoreResults);
  const [error, setError] = useState<string | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const [loadMoreError, setLoadMoreError] = useState<string | null>(null);

  // runs again whenever the filters change, e.g. from the "widen" chips
  useEffect(() => {
    void search().catch((err) => setError(getErrorMessage(err)));
  }, [filters, search]);

  function retry() {
    setError(null);
    void search().catch((err) => setError(getErrorMessage(err)));
  }

  async function loadMore() {
    setLoadMoreError(null);
    setLoadingMore(true);
    try {
      await loadMoreResults();
    } catch (err) {
      setLoadMoreError(getErrorMessage(err));
    } finally {
      setLoadingMore(false);
    }
  }

  const title = error
    ? 'Rides to work'
    : results === null
      ? 'Finding rides'
      : `${results.total} ride${results.total === 1 ? '' : 's'} to work`;

  return (
    <Screen
      header={
        <ResultsHeader
          title={title}
          subtitle={filterSummary(filters)}
          onBack={() => router.back()}
          onEdit={error || results === null ? undefined : () => router.back()}
        />
      }
      underTabBar>
      {error ? (
        <ErrorState message={error} onRetry={retry} />
      ) : results === null ? (
        <LoadingState />
      ) : results.items.length === 0 ? (
        <EmptyState filters={filters} onWiden={setSearchFilters} />
      ) : (
        <>
          <MatchLegend />
          {results.items.map((ride) => (
            <RideResultCard
              key={ride.id}
              ride={ride}
              onPress={() => router.push({ pathname: '/rides/[id]', params: { id: ride.id } })}
            />
          ))}
          {loadMoreError && <Banner message={loadMoreError} />}
          {results.items.length < results.total && (
            <Button
              label="Show more rides"
              variant="soft"
              loading={loadingMore}
              onPress={() => void loadMore()}
            />
          )}
        </>
      )}
    </Screen>
  );
}

// "8:00 AM ±30 min · within 1 km"
function filterSummary(filters: SearchFilters): string {
  return `${formatHhMmForDisplay(filters.leaveAround)} ±${filters.flexMinutes} min · within ${formatDistance(filters.maxWalkKm)}`;
}

function ResultsHeader({
  title,
  subtitle,
  onBack,
  onEdit,
}: {
  title: string;
  subtitle: string;
  onBack: () => void;
  onEdit?: () => void;
}) {
  const theme = useTheme();
  return (
    <View style={styles.header}>
      <Pressable accessibilityRole="button" accessibilityLabel="Back" onPress={onBack} hitSlop={8}>
        <SymbolView name={Icons.back} size={20} tintColor={theme.text} />
      </Pressable>
      <View style={styles.grow}>
        <ThemedText style={styles.headerTitle}>{title}</ThemedText>
        <ThemedText type="small" themeColor="textSecondary">
          {subtitle}
        </ThemedText>
      </View>
      {onEdit && (
        <Pressable accessibilityRole="button" onPress={onEdit} hitSlop={8}>
          <ThemedText type="smallBold" themeColor="primary">
            Edit
          </ThemedText>
        </Pressable>
      )}
    </View>
  );
}

function MatchLegend() {
  const theme = useTheme();
  return (
    <View style={[styles.legend, { backgroundColor: theme.backgroundElement }]}>
      <ThemedText type="smallBold">Sorted by Smart Matching Score</ThemedText>
      <View style={styles.legendRow}>
        <LegendItem bars={5} label="90+ strong" />
        <LegendItem bars={4} label="80+ good" />
        <LegendItem bars={3} label="70+ fair" />
      </View>
    </View>
  );
}

function LegendItem({ bars, label }: { bars: number; label: string }) {
  return (
    <View style={styles.legendItem}>
      <SignalBars filled={bars} />
      <ThemedText type="small" themeColor="textSecondary">
        {label}
      </ThemedText>
    </View>
  );
}

function LoadingState() {
  const theme = useTheme();
  return (
    <>
      <View style={[styles.legend, { backgroundColor: theme.backgroundElement }]}>
        <ThemedText type="smallBold">Matching coworkers on your route</ThemedText>
      </View>
      <Skeleton height={150} radius={Spacing.four} />
      <Skeleton height={150} radius={Spacing.four} />
      <Skeleton height={150} radius={Spacing.four} />
    </>
  );
}

function EmptyState({
  filters,
  onWiden,
}: {
  filters: SearchFilters;
  onWiden: (filters: SearchFilters) => void;
}) {
  const canWidenTime = filters.flexMinutes < WIDEST_FLEX_MINUTES;
  const canWidenWalk = filters.maxWalkKm < WIDEST_WALK_KM;

  return (
    <StateMessage
      icon="locationSlash"
      title="No matches in your area or time window"
      message="Try widening your filters.">
      <View style={styles.chips}>
        {canWidenTime && (
          <WidenChip
            label={`±${WIDEST_FLEX_MINUTES} min`}
            onPress={() => onWiden({ ...filters, flexMinutes: WIDEST_FLEX_MINUTES })}
          />
        )}
        {canWidenWalk && (
          <WidenChip
            label={`Within ${formatDistance(WIDEST_WALK_KM)}`}
            onPress={() => onWiden({ ...filters, maxWalkKm: WIDEST_WALK_KM })}
          />
        )}
      </View>
    </StateMessage>
  );
}

function WidenChip({ label, onPress }: { label: string; onPress: () => void }) {
  const theme = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={[styles.chip, { backgroundColor: theme.primarySoft }]}>
      <ThemedText type="smallBold" themeColor="primarySoftText">
        {label}
      </ThemedText>
    </Pressable>
  );
}

function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <StateMessage
      icon="wifiSlash"
      tone="error"
      title="Couldn't load rides"
      message={`${message} Your filters are saved.`}
      action={{ label: 'Try again', onPress: onRetry }}
    />
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
  },
  grow: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    lineHeight: 30,
    fontWeight: 700,
  },
  legend: {
    borderRadius: Spacing.three,
    padding: Spacing.three,
    gap: Spacing.two,
  },
  legendRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: Spacing.two,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
  },
  center: {
    textAlign: 'center',
  },
  chips: {
    flexDirection: 'row',
    gap: Spacing.two,
    paddingTop: Spacing.two,
  },
  chip: {
    borderRadius: Spacing.three,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
  },
});
