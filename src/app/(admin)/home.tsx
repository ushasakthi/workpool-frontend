import { useFocusEffect, useRouter } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { useCallback, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Banner } from '@/components/ui/banner';
import { Button } from '@/components/ui/button';
import { Icons } from '@/constants/icons';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useAdminStore } from '@/stores/useAdminStore';
import type { AdminStats } from '@/types/admin.types';
import { getErrorMessage } from '@/utils/errors';
import { formatTimeAgo } from '@/utils/formatters';

export default function AdminDashboardScreen() {
  const router = useRouter();
  const stats = useAdminStore((state) => state.stats);
  const loadedAt = useAdminStore((state) => state.statsLoadedAt);
  const loadStats = useAdminStore((state) => state.loadStats);
  const [error, setError] = useState<string | null>(null);

  // fresh numbers every time the dashboard is opened
  useFocusEffect(
    useCallback(() => {
      setError(null);
      void loadStats().catch((err) => setError(getErrorMessage(err)));
    }, [loadStats]),
  );

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <View style={styles.titleRow}>
        <View style={styles.grow}>
          <ThemedText type="title" style={styles.title}>
            Dashboard
          </ThemedText>
          <ThemedText themeColor="textSecondary">All WorkPool users</ThemedText>
        </View>
        {loadedAt && (
          <ThemedText type="small" themeColor="textSecondary">
            Updated {loadedAt.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
          </ThemedText>
        )}
      </View>

      {error && (
        <View style={styles.errorRow}>
          <View style={styles.grow}>
            <Banner message={error} />
          </View>
          <Button
            label="Try again"
            variant="soft"
            onPress={() => {
              setError(null);
              void loadStats().catch((err) => setError(getErrorMessage(err)));
            }}
          />
        </View>
      )}

      <View style={styles.statsRow}>
        {stats ? <StatCards stats={stats} /> : <StatCardSkeletons />}
      </View>

      <ThemedText type="smallBold">Queues</ThemedText>
      <View style={styles.statsRow}>
        <QueueCard
          icon="shieldCheck"
          title="Verification queue"
          count={stats?.pendingVerifications}
          detail={stats && verificationDetail(stats)}
          onPress={() => router.push('/verifications')}
        />
        <QueueCard
          icon="flag"
          title="Reports queue"
          count={stats?.openReports}
          detail={stats && reportsDetail(stats)}
          urgent={(stats?.openReports ?? 0) > 0}
          onPress={() => router.push('/reports')}
        />
      </View>

      {!stats && !error && (
        <View style={styles.loadingLine}>
          <ActivityIndicator />
          <ThemedText themeColor="textSecondary">Loading dashboard…</ThemedText>
        </View>
      )}

      {stats?.totalUsers === 0 && (
        <Banner
          tone="success"
          icon="infoCircle"
          message="No one has joined yet. Stats fill in once employees sign up."
        />
      )}
    </ScrollView>
  );
}

// "12 pending · oldest submitted 2 days ago"
function verificationDetail(stats: AdminStats): string {
  if (stats.pendingVerifications === 0 || !stats.oldestPendingVerificationAt) {
    return 'Nothing waiting';
  }
  return `${stats.pendingVerifications} pending · oldest submitted ${formatTimeAgo(stats.oldestPendingVerificationAt)}`;
}

// "7 open · 2 safety · oldest filed 6 days ago"
function reportsDetail(stats: AdminStats): string {
  if (stats.openReports === 0 || !stats.oldestOpenReportAt) {
    return 'Nothing waiting';
  }
  return `${stats.openReports} open · ${stats.openSafetyReports} safety · oldest filed ${formatTimeAgo(stats.oldestOpenReportAt)}`;
}

function StatCards({ stats }: { stats: AdminStats }) {
  const none = 'None yet';
  return (
    <>
      <StatCard
        label="Total users"
        value={stats.totalUsers}
        detail={
          stats.totalUsers === 0
            ? 'No sign-ups yet'
            : stats.newUsersThisWeek === 0
              ? 'No new sign-ups this week'
              : `+${stats.newUsersThisWeek} this week`
        }
      />
      <StatCard
        label="Active rides"
        value={stats.activeRides}
        detail={stats.activeRides === 0 ? none : 'Taking bookings now'}
      />
      <StatCard
        label="Completed rides"
        value={stats.completedRides}
        detail={stats.completedRides === 0 ? none : `${stats.completedRidesThisMonth} this month`}
      />
      <StatCard
        label="Open reports"
        value={stats.openReports}
        detail={
          stats.openReports === 0
            ? none
            : stats.openSafetyReports > 0
              ? `${stats.openSafetyReports} flagged safety`
              : 'No safety flags'
        }
        urgent={stats.openSafetyReports > 0}
      />
    </>
  );
}

function StatCard({
  label,
  value,
  detail,
  urgent = false,
}: {
  label: string;
  value: number;
  detail: string;
  // red detail text, the words still say why
  urgent?: boolean;
}) {
  const theme = useTheme();
  return (
    <View style={[styles.card, { backgroundColor: theme.background, borderColor: theme.border }]}>
      <ThemedText type="small" themeColor="textSecondary">
        {label}
      </ThemedText>
      <ThemedText style={styles.statValue}>{value.toLocaleString()}</ThemedText>
      <ThemedText
        type={urgent ? 'smallBold' : 'small'}
        themeColor={urgent ? 'error' : 'textSecondary'}>
        {detail}
      </ThemedText>
    </View>
  );
}

function StatCardSkeletons() {
  const theme = useTheme();
  return (
    <>
      {['Total users', 'Active rides', 'Completed rides', 'Open reports'].map((label) => (
        <View
          key={label}
          style={[styles.card, { backgroundColor: theme.background, borderColor: theme.border }]}>
          <ThemedText type="small" themeColor="textSecondary">
            {label}
          </ThemedText>
          <View style={[styles.skeletonValue, { backgroundColor: theme.backgroundSelected }]} />
          <View style={[styles.skeletonLine, { backgroundColor: theme.backgroundElement }]} />
        </View>
      ))}
    </>
  );
}

function QueueCard({
  icon,
  title,
  count,
  detail,
  urgent = false,
  onPress,
}: {
  icon: keyof typeof Icons;
  title: string;
  // undefined while loading
  count?: number;
  detail?: string | null;
  urgent?: boolean;
  onPress: () => void;
}) {
  const theme = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        styles.queueCard,
        { backgroundColor: theme.background, borderColor: theme.border },
        pressed && styles.pressed,
      ]}>
      <View style={[styles.queueIcon, { backgroundColor: theme.primarySoft }]}>
        <SymbolView name={Icons[icon]} size={22} tintColor={theme.primary} />
      </View>
      <View style={styles.grow}>
        <ThemedText type="smallBold">{title}</ThemedText>
        {detail ? (
          <ThemedText type="small" themeColor="textSecondary">
            {detail}
          </ThemedText>
        ) : (
          <View style={[styles.skeletonLine, { backgroundColor: theme.backgroundElement }]} />
        )}
      </View>
      <ThemedText style={styles.queueCount} themeColor={urgent ? 'error' : 'text'}>
        {count ?? '—'}
      </ThemedText>
      <SymbolView name={Icons.chevronRight} size={16} tintColor={theme.textSecondary} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: Spacing.four,
    gap: Spacing.four,
  },
  grow: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: Spacing.three,
  },
  title: {
    fontSize: 28,
    lineHeight: 34,
  },
  errorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
  },
  statsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.three,
  },
  card: {
    flex: 1,
    minWidth: 200,
    borderWidth: 1,
    borderRadius: Spacing.four,
    padding: Spacing.four,
    gap: Spacing.one,
  },
  statValue: {
    fontSize: 36,
    lineHeight: 44,
    fontWeight: 700,
  },
  skeletonValue: {
    width: 120,
    height: 32,
    borderRadius: Spacing.three,
    marginVertical: Spacing.two,
  },
  skeletonLine: {
    width: 140,
    height: 10,
    borderRadius: Spacing.one,
    marginTop: Spacing.one,
  },
  queueCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    minWidth: 320,
  },
  pressed: {
    opacity: 0.8,
  },
  queueIcon: {
    width: 48,
    height: 48,
    borderRadius: Spacing.three,
    alignItems: 'center',
    justifyContent: 'center',
  },
  queueCount: {
    fontSize: 28,
    lineHeight: 34,
    fontWeight: 700,
  },
  loadingLine: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.two,
  },
});
