import { useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { listVerifications } from '@/api/admin.api';
import { AdminHeader } from '@/components/admin/admin-header';
import { Avatar } from '@/components/admin/avatar';
import { FilterTabs } from '@/components/admin/filter-tabs';
import { StatusBadge, statusBadgeTone } from '@/components/admin/status-badge';
import { ThemedText } from '@/components/themed-text';
import { Banner } from '@/components/ui/banner';
import { StatusIcon } from '@/components/ui/status-icon';
import { Spacing } from '@/constants/theme';
import { VerificationStatus } from '@/constants/verification-status.enum';
import { useTheme } from '@/hooks/use-theme';
import type { VerificationSubmission } from '@/types/user.types';
import { formatDate } from '@/utils/formatters';
import { getErrorMessage } from '@/utils/errors';
import { getOverallVerificationStatus } from '@/utils/verification';

type FilterValue = 'all' | VerificationStatus;

const FILTER_TABS: { value: FilterValue; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: VerificationStatus.PENDING, label: 'Pending' },
  { value: VerificationStatus.VERIFIED, label: 'Verified' },
  { value: VerificationStatus.REJECTED, label: 'Rejected' },
];

const COLUMN_FLEX = { name: 2.2, email: 2.2, submitted: 1.2, nic: 1, linkedin: 1, status: 1 };

export default function VerificationQueueScreen() {
  const theme = useTheme();
  const router = useRouter();

  const [submissions, setSubmissions] = useState<VerificationSubmission[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterValue>('all');

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const result = await listVerifications();
        if (!cancelled) setSubmissions(result);
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

  const filteredSubmissions = useMemo(() => {
    if (!submissions) return [];
    if (filter === 'all') return submissions;
    return submissions.filter(
      (item) =>
        getOverallVerificationStatus(item.verification.identityStatus, item.verification.workplaceStatus) ===
        filter,
    );
  }, [submissions, filter]);

  return (
    <View style={styles.flex}>
      <AdminHeader />

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.titleRow}>
          <ThemedText type="title" style={styles.title}>
            Verification queue
          </ThemedText>
          <ThemedText themeColor="textSecondary">{pendingCount} awaiting review</ThemedText>
        </View>

        {error && <Banner message={error} />}

        <FilterTabs tabs={FILTER_TABS} value={filter} onChange={setFilter} />

        <View style={[styles.tableCard, { backgroundColor: theme.background, borderColor: theme.border }]}>
          <View style={[styles.headerRow, { borderBottomColor: theme.border }]}>
            <ThemedText type="small" themeColor="textSecondary" style={{ flex: COLUMN_FLEX.name }}>
              NAME
            </ThemedText>
            <ThemedText type="small" themeColor="textSecondary" style={{ flex: COLUMN_FLEX.email }}>
              WORKPLACE EMAIL
            </ThemedText>
            <ThemedText type="small" themeColor="textSecondary" style={{ flex: COLUMN_FLEX.submitted }}>
              SUBMITTED
            </ThemedText>
            <ThemedText type="small" themeColor="textSecondary" style={{ flex: COLUMN_FLEX.nic }}>
              NIC
            </ThemedText>
            <ThemedText type="small" themeColor="textSecondary" style={{ flex: COLUMN_FLEX.linkedin }}>
              LINKEDIN
            </ThemedText>
            <ThemedText type="small" themeColor="textSecondary" style={{ flex: COLUMN_FLEX.status }}>
              STATUS
            </ThemedText>
          </View>

          {submissions === null &&
            Array.from({ length: 6 }).map((_, index) => <SkeletonRow key={index} />)}

          {submissions !== null && filteredSubmissions.length === 0 && (
            <View style={styles.emptyState}>
              <StatusIcon variant="success" icon="checkCircle" size={56} />
              <ThemedText type="smallBold" style={styles.emptyTitle}>
                No pending reviews
              </ThemedText>
              <ThemedText themeColor="textSecondary" style={styles.emptyText}>
                Every submission matching this filter has been reviewed. New sign-ups will appear here
                automatically.
              </ThemedText>
            </View>
          )}

          {submissions !== null &&
            filteredSubmissions.map((item) => {
              const status = getOverallVerificationStatus(
                item.verification.identityStatus,
                item.verification.workplaceStatus,
              );
              return (
                <Pressable
                  key={item.id}
                  style={[styles.dataRow, { borderBottomColor: theme.border }]}
                  onPress={() => router.push(`/verifications/${item.id}`)}>
                  <View style={[styles.nameCell, { flex: COLUMN_FLEX.name }]}>
                    <Avatar name={item.name} />
                    <ThemedText type="smallBold">{item.name}</ThemedText>
                  </View>
                  <ThemedText style={{ flex: COLUMN_FLEX.email }} numberOfLines={1}>
                    {item.email}
                  </ThemedText>
                  <ThemedText themeColor="textSecondary" style={{ flex: COLUMN_FLEX.submitted }}>
                    {item.verification.submittedAt ? formatDate(item.verification.submittedAt) : '—'}
                  </ThemedText>
                  <View style={{ flex: COLUMN_FLEX.nic }}>
                    <StatusBadge label="Uploaded" tone="neutral" />
                  </View>
                  <View style={{ flex: COLUMN_FLEX.linkedin }}>
                    <StatusBadge label="Provided" tone="neutral" />
                  </View>
                  <View style={{ flex: COLUMN_FLEX.status }}>
                    <StatusBadge
                      label={status.charAt(0).toUpperCase() + status.slice(1)}
                      tone={statusBadgeTone(status)}
                    />
                  </View>
                </Pressable>
              );
            })}
        </View>
      </ScrollView>
    </View>
  );
}

function SkeletonRow() {
  const theme = useTheme();
  const bar = (flex: number, widthPercent: number) => (
    <View style={{ flex }}>
      <View
        style={[
          styles.skeletonBar,
          { width: `${widthPercent}%`, backgroundColor: theme.backgroundSelected },
        ]}
      />
    </View>
  );

  return (
    <View style={[styles.dataRow, { borderBottomColor: theme.border }]}>
      {bar(COLUMN_FLEX.name, 70)}
      {bar(COLUMN_FLEX.email, 80)}
      {bar(COLUMN_FLEX.submitted, 60)}
      {bar(COLUMN_FLEX.nic, 60)}
      {bar(COLUMN_FLEX.linkedin, 60)}
      {bar(COLUMN_FLEX.status, 50)}
    </View>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  content: {
    padding: Spacing.four,
    gap: Spacing.four,
  },
  titleRow: {
    gap: Spacing.half,
  },
  title: {
    fontSize: 28,
    lineHeight: 34,
  },
  tableCard: {
    borderWidth: 1,
    borderRadius: Spacing.three,
    overflow: 'hidden',
  },
  headerRow: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderBottomWidth: 1,
  },
  dataRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.three,
    borderBottomWidth: 1,
    gap: Spacing.two,
  },
  nameCell: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  skeletonBar: {
    height: 14,
    borderRadius: Spacing.one,
  },
  emptyState: {
    alignItems: 'center',
    gap: Spacing.two,
    paddingVertical: Spacing.six,
    paddingHorizontal: Spacing.five,
  },
  emptyTitle: {
    fontSize: 18,
  },
  emptyText: {
    textAlign: 'center',
    maxWidth: 420,
  },
});
