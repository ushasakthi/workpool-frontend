import { useRouter } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { FilterTabs } from '@/components/admin/filter-tabs';
import { ThemedText } from '@/components/themed-text';
import { Screen } from '@/components/ui/screen';
import { Skeleton } from '@/components/ui/skeleton';
import { StateMessage } from '@/components/ui/state-message';
import { Icons } from '@/constants/icons';
import { Spacing } from '@/constants/theme';
import { UserRole } from '@/constants/user-role.enum';
import { useTheme } from '@/hooks/use-theme';
import { useAuthStore } from '@/stores/useAuthStore';
import { useBookingStore } from '@/stores/useBookingStore';
import type { Savings } from '@/types/booking.types';
import { getErrorMessage } from '@/utils/errors';
import { formatCost } from '@/utils/formatters';
import { formatMonth, shiftMonth } from '@/utils/time';

type Side = 'passenger' | 'driver';

const SIDE_TABS: { value: Side; label: string }[] = [
  { value: 'passenger', label: 'As passenger' },
  { value: 'driver', label: 'As driver' },
];

// what one side of the month shows: the big number, two stats, the breakdown
interface SideView {
  heroLabel: string;
  amount: number;
  heroText: string;
  rides: number;
  avg: number;
  avgLabel: string;
  co2SavedKg: number;
  lines: { label: string; value: string }[];
  totalLabel: string;
  note: string;
}

function passengerView(savings: Savings): SideView {
  const p = savings.asPassenger;
  return {
    heroLabel: 'Estimated savings',
    amount: p.saved,
    heroText: 'Less than driving alone, by splitting commute costs with coworkers',
    rides: p.rides,
    avg: p.avgContribution,
    avgLabel: 'avg. cost contribution',
    co2SavedKg: p.co2SavedKg,
    lines: [
      { label: `Driving alone · ${p.rides} ride${p.rides === 1 ? '' : 's'}`, value: formatCost(p.soloCost) },
      { label: 'Your cost contributions', value: `−${formatCost(p.contributions)}` },
    ],
    totalLabel: 'You saved',
    note: "Driving alone means fuel, wear and a day's parking for the same route. Figures are estimates.",
  };
}

function driverView(savings: Savings): SideView {
  const d = savings.asDriver;
  return {
    heroLabel: 'Costs shared with riders',
    amount: d.costsShared,
    heroText: 'Of your commute costs covered by coworkers riding with you',
    rides: d.rides,
    avg: d.avgShared,
    avgLabel: 'avg. shared per ride',
    co2SavedKg: d.co2SavedKg,
    lines: [
      { label: `Your trip costs · ${d.rides} ride${d.rides === 1 ? '' : 's'}`, value: formatCost(d.tripCost) },
      { label: 'Your share after contributions', value: formatCost(d.yourShare) },
    ],
    totalLabel: 'Costs shared',
    note: 'Contributions are capped at the cost of each trip, so they reduce what you spend — they never exceed it.',
  };
}

export default function SavingsScreen() {
  const router = useRouter();
  const role = useAuthStore((state) => state.user?.role);
  const savings = useBookingStore((state) => state.savings);
  const loadSavings = useBookingStore((state) => state.loadSavings);

  // undefined = this month (the server decides, in Colombo time)
  const [month, setMonth] = useState<string | undefined>(undefined);
  // only "both" users choose a side; for everyone else the role decides. Worked out on
  // every render because the user may still be loading on the first one
  const [chosenSide, setChosenSide] = useState<Side>('passenger');
  const side: Side =
    role === UserRole.DRIVER ? 'driver' : role === UserRole.BOTH ? chosenSide : 'passenger';
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void loadSavings(month).catch((err) => setError(getErrorMessage(err)));
  }, [month, loadSavings]);

  function goToMonth(next: string) {
    setError(null);
    setMonth(next);
  }

  const view = savings && (side === 'driver' ? driverView(savings) : passengerView(savings));

  return (
    <Screen header={<BackHeader onBack={() => router.back()} />} underTabBar>
      {role === UserRole.BOTH && (
        <FilterTabs tabs={SIDE_TABS} value={chosenSide} onChange={setChosenSide} />
      )}

      {savings && (
        <MonthPicker
          label={formatMonth(savings.month)}
          canGoForward={!savings.isCurrentMonth}
          onBack={() => goToMonth(shiftMonth(savings.month, -1))}
          onForward={() => goToMonth(shiftMonth(savings.month, 1))}
        />
      )}

      {error ? (
        <StateMessage
          icon="wifiSlash"
          tone="error"
          title="Couldn't load your savings"
          message={error}
          action={{
            label: 'Try again',
            variant: 'soft',
            onPress: () => {
              setError(null);
              void loadSavings(month).catch((err) => setError(getErrorMessage(err)));
            },
          }}
        />
      ) : !savings || !view ? (
        <>
          <Skeleton height={56} radius={Spacing.three} />
          <Skeleton height={240} radius={Spacing.four} />
          <Skeleton height={100} radius={Spacing.four} />
        </>
      ) : view.rides === 0 ? (
        <EmptyState
          month={formatMonth(savings.month)}
          side={side}
          onAction={() => router.push(side === 'driver' ? '/rides/post' : '/rides/search')}
        />
      ) : (
        <SavingsDetail view={view} isCurrentMonth={savings.isCurrentMonth} />
      )}
    </Screen>
  );
}

function SavingsDetail({ view, isCurrentMonth }: { view: SideView; isCurrentMonth: boolean }) {
  const theme = useTheme();
  const [showHow, setShowHow] = useState(true);

  return (
    <>
      <View style={[styles.hero, { backgroundColor: theme.primarySoft }]}>
        <ThemedText type="smallBold" themeColor="primarySoftText">
          {view.heroLabel}
        </ThemedText>
        <ThemedText themeColor="primarySoftText" style={styles.heroAmount} numberOfLines={1} adjustsFontSizeToFit>
          {formatCost(view.amount)}
        </ThemedText>
        <ThemedText style={styles.center}>{view.heroText}</ThemedText>
        <ThemedText type="small" themeColor="textSecondary">
          {isCurrentMonth ? 'Month in progress · estimate' : 'Estimate'}
        </ThemedText>
      </View>

      <View style={styles.stats}>
        <StatBox
          value={String(view.rides)}
          label={`shared ride${view.rides === 1 ? '' : 's'} completed`}
        />
        <StatBox value={formatCost(view.avg)} label={view.avgLabel} />
      </View>

      <View style={styles.co2Row}>
        <View style={[styles.co2Icon, { backgroundColor: theme.primarySoft }]}>
          <SymbolView name={Icons.leaf} size={18} tintColor={theme.primary} />
        </View>
        <View>
          <ThemedText type="smallBold">≈ {view.co2SavedKg.toFixed(1)} kg CO₂ saved</ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            vs. driving alone {isCurrentMonth ? 'this month' : 'that month'}
          </ThemedText>
        </View>
      </View>

      <Pressable
        accessibilityRole="button"
        accessibilityState={{ expanded: showHow }}
        onPress={() => setShowHow((open) => !open)}
        style={styles.howToggle}>
        <ThemedText type="smallBold" themeColor="primary">
          How this is calculated
        </ThemedText>
        <SymbolView
          name={showHow ? Icons.chevronUp : Icons.chevronDown}
          size={16}
          tintColor={theme.primary}
        />
      </Pressable>

      {showHow && (
        <View style={[styles.breakdown, { backgroundColor: theme.backgroundElement }]}>
          {view.lines.map((line) => (
            <View key={line.label} style={styles.line}>
              <ThemedText themeColor="textSecondary">{line.label}</ThemedText>
              <ThemedText themeColor="textSecondary">{line.value}</ThemedText>
            </View>
          ))}
          <View style={[styles.divider, { backgroundColor: theme.border }]} />
          <View style={styles.line}>
            <ThemedText type="smallBold">{view.totalLabel}</ThemedText>
            <ThemedText type="smallBold">{formatCost(view.amount)}</ThemedText>
          </View>
          <ThemedText type="small" themeColor="textSecondary">
            {view.note}
          </ThemedText>
        </View>
      )}

      <View style={styles.footNote}>
        <SymbolView name={Icons.infoCircle} size={16} tintColor={theme.textSecondary} />
        <ThemedText type="small" themeColor="textSecondary" style={styles.grow}>
          Contributions only cover shared trip costs. No one earns money from a WorkPool ride.
        </ThemedText>
      </View>
    </>
  );
}

function MonthPicker({
  label,
  canGoForward,
  onBack,
  onForward,
}: {
  label: string;
  canGoForward: boolean;
  onBack: () => void;
  onForward: () => void;
}) {
  const theme = useTheme();
  const arrow = (icon: 'chevronLeft' | 'chevronRight', name: string, enabled: boolean, onPress: () => void) => (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={name}
      disabled={!enabled}
      onPress={onPress}
      style={[styles.monthButton, { borderColor: theme.border }, !enabled && styles.disabled]}>
      <SymbolView name={Icons[icon]} size={18} tintColor={theme.text} />
    </Pressable>
  );
  return (
    <View style={styles.monthRow}>
      {arrow('chevronLeft', 'Previous month', true, onBack)}
      <ThemedText type="smallBold" style={styles.monthLabel}>
        {label}
      </ThemedText>
      {arrow('chevronRight', 'Next month', canGoForward, onForward)}
    </View>
  );
}

function StatBox({ value, label }: { value: string; label: string }) {
  const theme = useTheme();
  return (
    <View style={[styles.statBox, { borderColor: theme.border }]}>
      <ThemedText style={styles.statValue}>{value}</ThemedText>
      <ThemedText type="small" themeColor="textSecondary">
        {label}
      </ThemedText>
    </View>
  );
}

function EmptyState({
  month,
  side,
  onAction,
}: {
  month: string;
  side: Side;
  onAction: () => void;
}) {
  return (
    <StateMessage
      icon="savings"
      title={`Nothing to show for ${month}`}
      message={
        side === 'driver'
          ? 'Complete a shared ride as a driver and you’ll see how much of your commute coworkers cover.'
          : 'Complete a shared ride and you’ll see what splitting commute costs saves you each month.'
      }
      action={{ label: side === 'driver' ? 'Post a ride' : 'Find a ride', onPress: onAction }}
    />
  );
}

function BackHeader({ onBack }: { onBack: () => void }) {
  const theme = useTheme();
  return (
    <View style={styles.header}>
      <Pressable accessibilityRole="button" accessibilityLabel="Back" onPress={onBack} hitSlop={8}>
        <SymbolView name={Icons.back} size={20} tintColor={theme.text} />
      </Pressable>
      <ThemedText style={styles.headerTitle}>Your savings</ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
  },
  headerTitle: {
    fontSize: 24,
    lineHeight: 30,
    fontWeight: 700,
  },
  grow: {
    flex: 1,
  },
  center: {
    textAlign: 'center',
  },
  monthRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
  },
  monthLabel: {
    flex: 1,
    textAlign: 'center',
    fontSize: 16,
  },
  monthButton: {
    width: 48,
    height: 48,
    borderWidth: 1,
    borderRadius: Spacing.three,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabled: {
    opacity: 0.35,
  },
  hero: {
    alignItems: 'center',
    gap: Spacing.two,
    borderRadius: Spacing.four,
    paddingVertical: Spacing.five,
    paddingHorizontal: Spacing.four,
  },
  heroAmount: {
    fontSize: 52,
    lineHeight: 60,
    fontWeight: 800,
  },
  stats: {
    flexDirection: 'row',
    gap: Spacing.three,
  },
  statBox: {
    flex: 1,
    borderWidth: 1,
    borderRadius: Spacing.four,
    padding: Spacing.three,
    gap: Spacing.one,
  },
  statValue: {
    fontSize: 24,
    lineHeight: 30,
    fontWeight: 700,
  },
  co2Row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
  },
  co2Icon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  howToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  breakdown: {
    borderRadius: Spacing.four,
    padding: Spacing.three,
    gap: Spacing.two,
  },
  line: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: Spacing.two,
  },
  divider: {
    height: 1,
    marginVertical: Spacing.one,
  },
  footNote: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.two,
  },
});
