import { useRouter } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { FilterTabs } from '@/components/admin/filter-tabs';
import { StatusBadge } from '@/components/admin/status-badge';
import { ThemedText } from '@/components/themed-text';
import { Banner } from '@/components/ui/banner';
import { Button } from '@/components/ui/button';
import { StatusIcon } from '@/components/ui/status-icon';
import { Icons } from '@/constants/icons';
import { ReportSeverity } from '@/constants/report-severity.enum';
import { ReportStatus } from '@/constants/report-status.enum';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useAdminStore } from '@/stores/useAdminStore';
import type { AdminReport } from '@/types/report.types';
import { getErrorMessage } from '@/utils/errors';
import { daysSince, formatDate, formatTimeAgo } from '@/utils/formatters';
import { REPORT_CATEGORY_LABEL, reportCode, SAFETY_CATEGORIES } from '@/utils/reports';

const COLUMN_FLEX = { code: 0.8, reason: 3, reported: 2, reporter: 2.2, filed: 1.2, decision: 1.8 };
// the two buttons need a fixed space, the text columns share the rest
const RESOLVE_WIDTH = 270;
// waiting longer than this is shown in red as overdue
const OVERDUE_DAYS = 4;

type Resolution = ReportStatus.REVIEWED | ReportStatus.DISMISSED;

const SEVERITY_OPTIONS: { value: ReportSeverity; label: string; hint: string }[] = [
  { value: ReportSeverity.LOW, label: 'Low', hint: 'Minor, e.g. late pickup' },
  { value: ReportSeverity.MEDIUM, label: 'Medium', hint: 'Repeated or disrespectful' },
  { value: ReportSeverity.HIGH, label: 'High', hint: 'Safety risk' },
];

type ReportsView = 'open' | 'history';

const VIEW_TABS: { value: ReportsView; label: string }[] = [
  { value: 'open', label: 'Open' },
  { value: 'history', label: 'History' },
];

export default function AdminReportsScreen() {
  const [view, setView] = useState<ReportsView>('open');

  return (
    <View style={styles.flex}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.tabs}>
          <FilterTabs tabs={VIEW_TABS} value={view} onChange={setView} />
        </View>
        {view === 'open' ? <OpenReports /> : <ReportHistory />}
      </ScrollView>
    </View>
  );
}

function OpenReports() {
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

  async function act(id: string, status: Resolution, severity?: ReportSeverity) {
    setActionError(null);
    setBusy({ id, status });
    try {
      await resolve(id, status, severity);
    } catch (err) {
      setActionError(getErrorMessage(err));
    } finally {
      setBusy(null);
    }
  }

  return (
    <>
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
              onResolve={(status, severity) => void act(report.id, status, severity)}
            />
          ))}
        </View>
    </>
  );
}

// upheld and dismissed reports, so a decision never disappears
function ReportHistory() {
  const theme = useTheme();
  const history = useAdminStore((state) => state.reportHistory);
  const load = useAdminStore((state) => state.loadReportHistory);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    void load().catch((err) => setLoadError(getErrorMessage(err)));
  }, [load]);

  return (
    <>
      <View>
        <ThemedText type="title" style={styles.title}>
          Report history
        </ThemedText>
        <ThemedText themeColor="textSecondary">
          {loadError
            ? 'Couldn’t load the history'
            : history === null
              ? 'Loading…'
              : `${history.length} decided · newest first`}
        </ThemedText>
      </View>

      {loadError && <Banner message={loadError} />}

      <View style={[styles.tableCard, { backgroundColor: theme.background, borderColor: theme.border }]}>
        <HistoryHeaderRow />

        {history === null &&
          !loadError &&
          Array.from({ length: 4 }).map((_, index) => <SkeletonRow key={index} />)}

        {history !== null && history.length === 0 && (
          <View style={styles.emptyState}>
            <ThemedText type="smallBold" style={styles.emptyTitle}>
              No decisions yet
            </ThemedText>
            <ThemedText themeColor="textSecondary">
              Upheld and dismissed reports appear here.
            </ThemedText>
          </View>
        )}

        {history?.map((report) => <HistoryRow key={report.id} report={report} />)}
      </View>
    </>
  );
}

function HistoryHeaderRow() {
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
      {cell('Reporter', COLUMN_FLEX.reporter)}
      {cell('Decision', COLUMN_FLEX.decision)}
      {cell('Decided', COLUMN_FLEX.filed)}
    </View>
  );
}

function HistoryRow({ report }: { report: AdminReport }) {
  const theme = useTheme();
  const upheld = report.status === ReportStatus.REVIEWED;
  const severity = SEVERITY_OPTIONS.find((option) => option.value === report.severity)?.label;

  return (
    <View style={[styles.dataRow, styles.rowBorder, { borderBottomColor: theme.border }]}>
      <ThemedText type="smallBold" themeColor="textSecondary" style={{ flex: COLUMN_FLEX.code }}>
        {reportCode(report.id)}
      </ThemedText>
      <View style={{ flex: COLUMN_FLEX.reason }}>
        <ThemedText type="smallBold">{REPORT_CATEGORY_LABEL[report.category]}</ThemedText>
        <ThemedText type="small" themeColor="textSecondary" numberOfLines={1}>
          {report.reason ? `“${report.reason}”` : 'No details given'}
        </ThemedText>
      </View>
      <ThemedText type="smallBold" style={{ flex: COLUMN_FLEX.reported }}>
        {report.reportedUser.name}
      </ThemedText>
      <ThemedText type="small" style={{ flex: COLUMN_FLEX.reporter }}>
        {report.reportedBy.name}
      </ThemedText>
      <View style={{ flex: COLUMN_FLEX.decision, alignItems: 'flex-start' }}>
        <StatusBadge
          label={upheld ? `Upheld${severity ? ` · ${severity}` : ''}` : 'Dismissed'}
          tone={upheld ? 'rejected' : 'neutral'}
        />
      </View>
      <ThemedText type="small" themeColor="textSecondary" style={{ flex: COLUMN_FLEX.filed }}>
        {report.resolvedAt ? formatDate(report.resolvedAt) : '—'}
      </ThemedText>
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
  onResolve: (status: Resolution, severity?: ReportSeverity) => void;
}) {
  const theme = useTheme();
  // Uphold opens the severity picker under the row, Confirm sends it
  const [picking, setPicking] = useState(false);
  const isSafety = SAFETY_CATEGORIES.includes(report.category);
  const overdue = daysSince(report.createdAt) > OVERDUE_DAYS;
  const { reportedUser, reportedBy } = report;

  return (
    <View style={[styles.rowBorder, { borderBottomColor: theme.border }]}>
      <View style={styles.dataRow}>
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
          <Button label="Uphold" variant="soft" disabled={locked} onPress={() => setPicking(true)} />
          <Button
            label="Dismiss"
            variant="text"
            loading={busy === ReportStatus.DISMISSED}
            disabled={locked}
            onPress={() => onResolve(ReportStatus.DISMISSED)}
          />
        </View>
      </View>

      {picking && (
        <SeverityPicker
          reportedUserName={reportedUser.name}
          busy={busy === ReportStatus.REVIEWED}
          locked={locked}
          onConfirm={(severity) => onResolve(ReportStatus.REVIEWED, severity)}
          onCancel={() => setPicking(false)}
        />
      )}
    </View>
  );
}

function SeverityPicker({
  reportedUserName,
  busy,
  locked,
  onConfirm,
  onCancel,
}: {
  reportedUserName: string;
  busy: boolean;
  locked: boolean;
  onConfirm: (severity: ReportSeverity) => void;
  onCancel: () => void;
}) {
  const theme = useTheme();
  const router = useRouter();
  const [severity, setSeverity] = useState<ReportSeverity | null>(null);

  return (
    <View style={styles.picker}>
      <ThemedText type="small" themeColor="textSecondary">
        Severity
      </ThemedText>

      <View style={styles.inline}>
        {SEVERITY_OPTIONS.map((option) => {
          const selected = option.value === severity;
          const high = option.value === ReportSeverity.HIGH;
          return (
            <Pressable
              key={option.value}
              accessibilityRole="button"
              disabled={locked}
              onPress={() => setSeverity(option.value)}
              style={[
                styles.chip,
                { borderColor: theme.border },
                selected && high && { backgroundColor: theme.errorSoft, borderColor: theme.errorSoft },
                selected && !high && { backgroundColor: theme.primarySoft, borderColor: theme.primary },
              ]}>
              <ThemedText type="smallBold" themeColor={selected && high ? 'error' : 'text'}>
                {option.label}
              </ThemedText>
              <ThemedText type="small" themeColor={selected && high ? 'error' : 'textSecondary'}>
                {option.hint}
              </ThemedText>
            </Pressable>
          );
        })}
      </View>

      {severity === ReportSeverity.HIGH && (
        <View style={styles.inline}>
          <SymbolView name={Icons.warningTriangle} size={16} tintColor={theme.error} />
          <ThemedText type="small" themeColor="error">
            Consider suspending this user
          </ThemedText>
          <Pressable
            accessibilityRole="link"
            onPress={() => router.push({ pathname: '/users', params: { search: reportedUserName } })}>
            <ThemedText type="smallBold" themeColor="primary" style={styles.underline}>
              Review suspension
            </ThemedText>
          </Pressable>
        </View>
      )}

      <View style={styles.inline}>
        <Button
          label="Confirm"
          loading={busy}
          disabled={locked || severity === null}
          onPress={() => severity && onConfirm(severity)}
        />
        <Button label="Cancel" variant="text" disabled={locked} onPress={onCancel} />
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
    <View style={[styles.dataRow, styles.rowBorder, { borderBottomColor: theme.border }]}>
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
  // the tabs share this width equally, like the Users screen
  tabs: {
    width: 220,
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
    gap: Spacing.two,
  },
  rowBorder: {
    borderBottomWidth: 1,
  },
  picker: {
    gap: Spacing.three,
    paddingHorizontal: Spacing.three,
    paddingBottom: Spacing.three,
  },
  chip: {
    borderWidth: 1,
    borderRadius: Spacing.three,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
  },
  underline: {
    textDecorationLine: 'underline',
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
