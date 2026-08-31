import { useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { getAdminStats, listVerifications, type AdminStats } from '@/api/admin.api';
import { Avatar } from '@/components/admin/avatar';
import { StatusBadge, statusBadgeTone } from '@/components/admin/status-badge';
import { ThemedText } from '@/components/themed-text';
import { Banner } from '@/components/ui/banner';
import { Spacing } from '@/constants/theme';
import { VerificationStatus } from '@/constants/verification-status.enum';
import { useTheme } from '@/hooks/use-theme';
import { useAuthStore } from '@/stores/useAuthStore';
import type { VerificationSubmission } from '@/types/user.types';
import { getErrorMessage } from '@/utils/errors';
import { formatDate } from '@/utils/formatters';
import { getOverallVerificationStatus } from '@/utils/verification';

const RECENT_COUNT = 5;

export default function AdminHomeScreen() {
  const theme = useTheme();
  const router = useRouter();
  const adminName = useAuthStore((state) => state.user?.name) ?? 'Admin';

  const [submissions, setSubmissions] = useState<VerificationSubmission[] | null>(null);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const [verifications, adminStats] = await Promise.all([listVerifications(), getAdminStats()]);
        if (cancelled) return;
        setSubmissions(verifications);
        setStats(adminStats);
      } catch (err) {
        if (!cancelled) setError(getErrorMessage(err));
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  const pendingCount = useMemo(
    () =>
      (submissions ?? []).filter(
        (item) =>
          getOverallVerificationStatus(item.verification.identityStatus, item.verification.workplaceStatus) ===
          VerificationStatus.PENDING,
      ).length,
    [submissions],
  );

  const recentSubmissions = useMemo(() => {
    if (!submissions) return [];
    return [...submissions]
      .sort((a, b) => {
        const aTime = a.verification.submittedAt ? new Date(a.verification.submittedAt).getTime() : 0;
        const bTime = b.verification.submittedAt ? new Date(b.verification.submittedAt).getTime() : 0;
        return bTime - aTime;
      })
      .slice(0, RECENT_COUNT);
  }, [submissions]);

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <View style={styles.headingGroup}>
        <ThemedText type="title" style={styles.title}>
          Good morning, {adminName}
        </ThemedText>
        <ThemedText themeColor="textSecondary">Here&apos;s what&apos;s happening with WorkPool today.</ThemedText>
      </View>

      {error && <Banner message={error} />}

      <View style={styles.statsRow}>
        <StatCard label="Pending verifications" value={submissions === null ? null : pendingCount} />
        <StatCard label="Active passengers" value={stats?.activePassengers ?? null} />
        <StatCard label="Active riders" value={stats?.activeRiders ?? null} />
        {/* No rides/bookings module yet — shown as a placeholder rather than a fabricated number. */}
        <StatCard label="Rides today" value={null} note="Not tracked yet" />
      </View>

      <View style={[styles.card, { backgroundColor: theme.background, borderColor: theme.border }]}>
        <View style={styles.cardHeader}>
          <ThemedText type="smallBold" style={styles.cardTitle}>
            Recent verification requests
          </ThemedText>
          <Pressable onPress={() => router.push('/verifications')}>
            <ThemedText type="linkPrimary" themeColor="primary">
              View all
            </ThemedText>
          </Pressable>
        </View>

        {submissions === null && (
          <ThemedText themeColor="textSecondary" style={styles.emptyRow}>
            Loading…
          </ThemedText>
        )}

        {submissions !== null && recentSubmissions.length === 0 && (
          <ThemedText themeColor="textSecondary" style={styles.emptyRow}>
            No verification requests yet.
          </ThemedText>
        )}

        {recentSubmissions.map((item, index) => {
          const status = getOverallVerificationStatus(
            item.verification.identityStatus,
            item.verification.workplaceStatus,
          );
          return (
            <Pressable
              key={item.id}
              style={[
                styles.row,
                index < recentSubmissions.length - 1 && { borderBottomWidth: 1, borderBottomColor: theme.border },
              ]}
              onPress={() => router.push(`/verifications/${item.id}`)}>
              <View style={styles.rowLeft}>
                <Avatar name={item.name} />
                <View>
                  <ThemedText type="smallBold">{item.name}</ThemedText>
                  <ThemedText themeColor="textSecondary" type="small">
                    {item.email}
                    {item.verification.submittedAt
                      ? ` · submitted ${formatDate(item.verification.submittedAt)}`
                      : ''}
                  </ThemedText>
                </View>
              </View>
              <StatusBadge
                label={status.charAt(0).toUpperCase() + status.slice(1)}
                tone={statusBadgeTone(status)}
              />
            </Pressable>
          );
        })}
      </View>
    </ScrollView>
  );
}

function StatCard({ label, value, note }: { label: string; value: number | null; note?: string }) {
  const theme = useTheme();

  return (
    <View style={[styles.statCard, { backgroundColor: theme.background, borderColor: theme.border }]}>
      <ThemedText themeColor="textSecondary" type="small">
        {label}
      </ThemedText>
      <ThemedText type="title" style={styles.statValue}>
        {value === null ? (note ? '—' : '…') : value}
      </ThemedText>
      {note && (
        <ThemedText themeColor="textSecondary" type="small">
          {note}
        </ThemedText>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: Spacing.four,
    gap: Spacing.four,
  },
  headingGroup: {
    gap: Spacing.half,
  },
  title: {
    fontSize: 28,
    lineHeight: 34,
  },
  statsRow: {
    flexDirection: 'row',
    gap: Spacing.three,
    flexWrap: 'wrap',
  },
  statCard: {
    flex: 1,
    minWidth: 180,
    borderWidth: 1,
    borderRadius: Spacing.three,
    padding: Spacing.four,
    gap: Spacing.one,
  },
  statValue: {
    fontSize: 28,
    lineHeight: 34,
  },
  card: {
    borderWidth: 1,
    borderRadius: Spacing.three,
    overflow: 'hidden',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.four,
    paddingBottom: Spacing.three,
  },
  cardTitle: {
    fontSize: 16,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.three,
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  emptyRow: {
    paddingHorizontal: Spacing.four,
    paddingBottom: Spacing.four,
  },
});
