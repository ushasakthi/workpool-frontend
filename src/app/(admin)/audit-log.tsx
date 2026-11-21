import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Banner } from '@/components/ui/banner';
import { StatusIcon } from '@/components/ui/status-icon';
import { AdminAction } from '@/constants/admin-action.enum';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useAdminStore } from '@/stores/useAdminStore';
import { getErrorMessage } from '@/utils/errors';
import { formatDate } from '@/utils/formatters';

const ACTION_LABEL: Record<AdminAction, string> = {
  [AdminAction.USER_SUSPENDED]: 'Suspended user',
  [AdminAction.USER_UNSUSPENDED]: 'Reinstated user',
  [AdminAction.VERIFICATION_APPROVED]: 'Approved verification',
  [AdminAction.VERIFICATION_REJECTED]: 'Rejected verification',
  [AdminAction.REPORT_REVIEWED]: 'Marked report reviewed',
  [AdminAction.REPORT_DISMISSED]: 'Dismissed report',
};

const COLUMN_FLEX = { when: 1.3, admin: 1.4, action: 1.6, user: 1.4, note: 2.6 };

// read-only: the log can't be edited from anywhere, which is the point
export default function AuditLogScreen() {
  const theme = useTheme();
  const entries = useAdminStore((state) => state.actionLog);
  const load = useAdminStore((state) => state.loadActionLog);
  const [error, setError] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      setError(null);
      void load().catch((err) => setError(getErrorMessage(err)));
    }, [load]),
  );

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <View>
        <ThemedText type="title" style={styles.title}>
          Audit log
        </ThemedText>
        <ThemedText themeColor="textSecondary">
          Every admin decision, newest first. Entries can&apos;t be edited or deleted.
        </ThemedText>
      </View>

      {error && <Banner message={error} />}

      <View style={[styles.tableCard, { backgroundColor: theme.background, borderColor: theme.border }]}>
        <View style={[styles.row, styles.headerRow, { backgroundColor: theme.backgroundElement, borderBottomColor: theme.border }]}>
          {(
            [
              ['When', COLUMN_FLEX.when],
              ['Admin', COLUMN_FLEX.admin],
              ['Action', COLUMN_FLEX.action],
              ['User', COLUMN_FLEX.user],
              ['Note', COLUMN_FLEX.note],
            ] as const
          ).map(([label, flex]) => (
            <ThemedText key={label} type="smallBold" themeColor="textSecondary" style={{ flex }}>
              {label}
            </ThemedText>
          ))}
        </View>

        {entries === null && !error && (
          <View style={styles.loadingLine}>
            <ActivityIndicator color={theme.primary} />
            <ThemedText themeColor="textSecondary">Loading audit log…</ThemedText>
          </View>
        )}

        {entries?.length === 0 && (
          <View style={styles.emptyState}>
            <StatusIcon variant="success" icon="history" size={56} />
            <ThemedText type="smallBold">No admin actions yet</ThemedText>
            <ThemedText themeColor="textSecondary">
              Suspensions, verification and report decisions appear here.
            </ThemedText>
          </View>
        )}

        {entries?.map((entry) => (
          <View key={entry.id} style={[styles.row, { borderBottomColor: theme.border }]}>
            <View style={{ flex: COLUMN_FLEX.when }}>
              <ThemedText type="small">{formatDate(entry.createdAt)}</ThemedText>
              <ThemedText type="small" themeColor="textSecondary">
                {new Date(entry.createdAt).toLocaleTimeString([], {
                  hour: 'numeric',
                  minute: '2-digit',
                })}
              </ThemedText>
            </View>
            <ThemedText type="smallBold" style={{ flex: COLUMN_FLEX.admin }}>
              {entry.admin.name}
            </ThemedText>
            <ThemedText type="small" style={{ flex: COLUMN_FLEX.action }}>
              {ACTION_LABEL[entry.action]}
            </ThemedText>
            <ThemedText type="small" style={{ flex: COLUMN_FLEX.user }}>
              {entry.targetUser?.name ?? '—'}
            </ThemedText>
            <ThemedText type="small" themeColor="textSecondary" style={{ flex: COLUMN_FLEX.note }}>
              {entry.note ?? '—'}
            </ThemedText>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: Spacing.four,
    gap: Spacing.four,
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
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.three,
    borderBottomWidth: 1,
    gap: Spacing.two,
  },
  headerRow: {
    paddingVertical: Spacing.two,
  },
  loadingLine: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.two,
    paddingVertical: Spacing.five,
  },
  emptyState: {
    alignItems: 'center',
    gap: Spacing.two,
    paddingVertical: Spacing.six,
  },
});
