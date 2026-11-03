import { SymbolView } from 'expo-symbols';
import { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Banner } from '@/components/ui/banner';
import { Button } from '@/components/ui/button';
import { StatusIcon } from '@/components/ui/status-icon';
import { Icons } from '@/constants/icons';
import { ReportStatus } from '@/constants/report-status.enum';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useAdminStore } from '@/stores/useAdminStore';
import type { AdminReport } from '@/types/report.types';
import { getErrorMessage } from '@/utils/errors';
import { daysSince, formatTimeAgo } from '@/utils/formatters';
import { REPORT_CATEGORY_LABEL, reportCode, SAFETY_CATEGORIES } from '@/utils/reports';

const COLUMN_FLEX = { code: 0.8, reason: 3, reported: 2, reporter: 2.2, filed: 1.2 };
// the two buttons need a fixed space, the text columns share the rest
const RESOLVE_WIDTH = 270;
// waiting longer than this is shown in red as overdue
const OVERDUE_DAYS = 4;

type Resolution = ReportStatus.REVIEWED | ReportStatus.DISMISSED;

export default function AdminReportsScreen() {
  const theme = useTheme();
  const reports = useAdminStore((state) => state.openReports);
  const load = useAdminStore((state) => state.loadOpenReports);
  const resolve = useAdminStore((state) => state.resolve);

  const [loadError, setLoadError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [busy, setBusy] = useState<{ id: string; status: Resolution } | null>(null);

  useEffect(() => {
    void load().catch((err) => setLoadError(getErrorMessage(err)));
  }, [load]);

  async function act(id: string, status: Resolution) {
    setActionError(null);
    setBusy({ id, status });
    try {
      await resolve(id, status);
    } catch (err) {
      setActionError(getErrorMessage(err));
    } finally {
      setBusy(null);
    }
  }

  return (
    <View style={styles.flex}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.titleRow}>
          <View style={styles.grow}>
            <ThemedText type="title" style={styles.title}>
              Open reports
            </ThemedText>
            <ThemedText themeColor="textSecondary">{summary(reports, loadError)}</ThemedText>
          </View>
          <ThemedText themeColor="textSecondary">
            Sorted by <ThemedText type="smallBold">oldest first</ThemedText>
          </ThemedText>
        </View>

        <View style={[styles.notice, { borderColor: theme.border }]}>
          <SymbolView name={Icons.lock} size={16} tintColor={theme.text} />
          <ThemedText type="small">
            <ThemedText type="smallBold">Reporter identity is admin-only. </ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              It&apos;s never shown to the reported user, in the app or in any notice they receive.
            </ThemedText>
          </ThemedText>
        </View>

        {loadError && <Banner message={loadError} />}
        {actionError && <Banner message={actionError} />}

        <View style={[styles.tableCard, { backgroundColor: theme.background, borderColor: theme.border }]}>
          <HeaderRow />

          {reports === null && !loadError && (
            <>
              {Array.from({ length: 6 }).map((_, index) => (
                <SkeletonRow key={index} />
              ))}
              <View style={styles.loadingLine}>
                <ActivityIndicator color={theme.primary} />
                <ThemedText themeColor="textSecondary">Loading open reports…</ThemedText>
              </View>
            </>
          )}

          {reports !== null && reports.length === 0 && (
            <View style={styles.emptyState}>
              <StatusIcon variant="success" icon="check" size={56} />
              <ThemedText type="smallBold" style={styles.emptyTitle}>
                No open reports
              </ThemedText>
              <ThemedText themeColor="textSecondary">
                New reports appear here as soon as they&apos;re filed.
              </ThemedText>
            </View>
          )}

          {reports?.map((report) => (
            <ReportRow
              key={report.id}
              report={report}
              busy={busy?.id === report.id ? busy.status : null}
              locked={busy !== null}
              onResolve={(status) => void act(report.id, status)}
            />
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

// "2 open · 1 safety · oldest filed 6 days ago"
function summary(reports: AdminReport[] | null, error: string | null): string {
  if (error) return 'Couldn’t load reports';
  if (reports === null) return 'Loading…';
  if (reports.length === 0) return 'All caught up';
  const safety = reports.filter((r) => SAFETY_CATEGORIES.includes(r.category)).length;
  return `${reports.length} open · ${safety} safety · oldest filed ${formatTimeAgo(reports[0].createdAt)}`;
}

function HeaderRow() {
  const theme = useTheme();
  const cell = (label: string, flex: number) => (
    <ThemedText type="smallBold" themeColor="textSecondary" style={{ flex }}>
      {label}
    </ThemedText>
  );
  return (
    <View style={[styles.headerRow, { backgroundColor: theme.backgroundElement, borderBottomColor: theme.border }]}>
      {cell('Report', COLUMN_FLEX.code)}
      {cell('Reason', COLUMN_FLEX.reason)}
      {cell('Reported user', COLUMN_FLEX.reported)}
      <View style={[styles.inline, { flex: COLUMN_FLEX.reporter }]}>
        <ThemedText type="smallBold" themeColor="textSecondary">
          Reporter
        </ThemedText>
        <SymbolView name={Icons.lock} size={12} tintColor={theme.textSecondary} />
      </View>
      {cell('Filed', COLUMN_FLEX.filed)}
      <ThemedText type="smallBold" themeColor="textSecondary" style={[styles.resolve, styles.right]}>
        Resolve
      </ThemedText>
    </View>
  );
}

function ReportRow({
  report,
  busy,
  locked,
  onResolve,
}: {
  report: AdminReport;
  busy: Resolution | null;
  // any row waiting on the server locks every row's buttons
  locked: boolean;
  onResolve: (status: Resolution) => void;
}) {
  const theme = useTheme();
  const isSafety = SAFETY_CATEGORIES.includes(report.category);
  const overdue = daysSince(report.createdAt) > OVERDUE_DAYS;
  const { reportedUser, reportedBy } = report;

  return (
    <View style={[styles.dataRow, { borderBottomColor: theme.border }]}>
      <ThemedText type="smallBold" themeColor="textSecondary" style={{ flex: COLUMN_FLEX.code }}>
        {reportCode(report.id)}
      </ThemedText>

      <View style={{ flex: COLUMN_FLEX.reason }}>
        <View style={styles.inline}>
          <ThemedText type="smallBold">{REPORT_CATEGORY_LABEL[report.category]}</ThemedText>
          {isSafety && (
            <View style={[styles.safetyTag, { backgroundColor: theme.errorSoft }]}>
              <ThemedText type="small" themeColor="error">
                Safety
              </ThemedText>
            </View>
          )}
        </View>
        <ThemedText type="small" themeColor="textSecondary" numberOfLines={1}>
          {report.reason ? `“${report.reason}”` : 'No details given'}
        </ThemedText>
      </View>

      <View style={{ flex: COLUMN_FLEX.reported }}>
        <ThemedText type="smallBold">{reportedUser.name}</ThemedText>
        <ThemedText type="small" themeColor="textSecondary" numberOfLines={1}>
          {reportedUser.role === 'driver' ? 'Driver' : 'Passenger'} · {reportedUser.otherReports} other
          report{reportedUser.otherReports === 1 ? '' : 's'}
        </ThemedText>
      </View>

      <View style={{ flex: COLUMN_FLEX.reporter }}>
        <ThemedText type="smallBold">{reportedBy.name}</ThemedText>
        <ThemedText type="small" themeColor="textSecondary" numberOfLines={1}>
          {reportedBy.email}
        </ThemedText>
      </View>

      <ThemedText
        type={overdue ? 'smallBold' : 'small'}
        themeColor={overdue ? 'error' : 'textSecondary'}
        numberOfLines={1}
        style={{ flex: COLUMN_FLEX.filed }}>
        {formatTimeAgo(report.createdAt)}
      </ThemedText>

      <View style={[styles.actions, styles.resolve]}>
        <Button
          label="Mark reviewed"
          variant="soft"
          loading={busy === ReportStatus.REVIEWED}
          disabled={locked}
          onPress={() => onResolve(ReportStatus.REVIEWED)}
        />
        <Button
          label="Dismiss"
          variant="text"
          loading={busy === ReportStatus.DISMISSED}
          disabled={locked}
          onPress={() => onResolve(ReportStatus.DISMISSED)}
        />
      </View>
    </View>
  );
}

function SkeletonRow() {
  const theme = useTheme();
  const bar = (flex: number, widthPercent: number) => (
    <View style={{ flex, gap: Spacing.one }}>
      <View style={[styles.skeletonBar, { width: `${widthPercent}%`, backgroundColor: theme.backgroundSelected }]} />
      <View style={[styles.skeletonBar, { width: `${widthPercent - 20}%`, backgroundColor: theme.backgroundElement }]} />
    </View>
  );
  return (
    <View style={[styles.dataRow, { borderBottomColor: theme.border }]}>
      {bar(COLUMN_FLEX.code, 60)}
      {bar(COLUMN_FLEX.reason, 70)}
      {bar(COLUMN_FLEX.reported, 70)}
      {bar(COLUMN_FLEX.reporter, 70)}
      {bar(COLUMN_FLEX.filed, 60)}
      <View style={styles.resolve}>
        <View style={[styles.skeletonButton, { backgroundColor: theme.backgroundElement }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  grow: {
    flex: 1,
  },
  content: {
    padding: Spacing.four,
    gap: Spacing.four,
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
  notice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    borderWidth: 1,
    borderRadius: Spacing.three,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
  },
  tableCard: {
    borderWidth: 1,
    borderRadius: Spacing.three,
    overflow: 'hidden',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderBottomWidth: 1,
    gap: Spacing.two,
  },
  right: {
    textAlign: 'right',
  },
  inline: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  dataRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.three,
    borderBottomWidth: 1,
    gap: Spacing.two,
  },
  safetyTag: {
    borderRadius: Spacing.two,
    paddingHorizontal: Spacing.two,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: Spacing.two,
  },
  skeletonBar: {
    height: 12,
    borderRadius: Spacing.one,
  },
  skeletonButton: {
    height: 40,
    borderRadius: Spacing.three,
  },
  resolve: {
    width: RESOLVE_WIDTH,
  },
  loadingLine: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.two,
    paddingVertical: Spacing.four,
  },
  emptyState: {
    alignItems: 'center',
    gap: Spacing.two,
    paddingVertical: Spacing.six,
  },
  emptyTitle: {
    fontSize: 18,
  },
});
