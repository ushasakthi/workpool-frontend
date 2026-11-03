import { SymbolView } from 'expo-symbols';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';

import type { ListUsersQuery } from '@/api/admin.api';
import { Avatar } from '@/components/admin/avatar';
import { FilterTabs } from '@/components/admin/filter-tabs';
import { StatusBadge, type BadgeTone } from '@/components/admin/status-badge';
import { ThemedText } from '@/components/themed-text';
import { Banner } from '@/components/ui/banner';
import { Button } from '@/components/ui/button';
import { TextField } from '@/components/ui/text-field';
import { Icons } from '@/constants/icons';
import { Spacing } from '@/constants/theme';
import { UserRole } from '@/constants/user-role.enum';
import { VerificationStatus } from '@/constants/verification-status.enum';
import { useTheme } from '@/hooks/use-theme';
import { useAdminStore } from '@/stores/useAdminStore';
import type { AdminUser } from '@/types/admin.types';
import { getErrorMessage } from '@/utils/errors';
import { formatDate, formatTimeAgo } from '@/utils/formatters';
import { getOverallVerificationStatus } from '@/utils/verification';

type StatusTab = 'all' | 'verified' | 'pending' | 'suspended';
type RoleTab = 'all' | UserRole;

const STATUS_TABS: { value: StatusTab; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'verified', label: 'Verified' },
  { value: 'pending', label: 'Pending' },
  { value: 'suspended', label: 'Suspended' },
];

const ROLE_TABS: { value: RoleTab; label: string }[] = [
  { value: 'all', label: 'All roles' },
  { value: UserRole.DRIVER, label: 'Driver' },
  { value: UserRole.PASSENGER, label: 'Passenger' },
  { value: UserRole.BOTH, label: 'Both' },
  { value: UserRole.ADMIN, label: 'Admin' },
];

const ROLE_LABEL: Record<UserRole, string> = {
  [UserRole.DRIVER]: 'Driver',
  [UserRole.PASSENGER]: 'Passenger',
  [UserRole.BOTH]: 'Both',
  [UserRole.ADMIN]: 'Admin',
};

const COLUMN_FLEX = { user: 2.6, trust: 0.9, role: 1, verification: 1.1, account: 1.6 };
const ACTION_WIDTH = 140;
// wait until typing pauses before searching
const SEARCH_DELAY_MS = 300;
const PAGE_SIZE = 100;

// the tabs and search box -> backend query params
function toQuery(q: string, status: StatusTab, role: RoleTab): ListUsersQuery {
  return {
    q: q.trim() || undefined,
    status: status === 'suspended' ? 'suspended' : undefined,
    verification: status === 'verified' || status === 'pending' ? status : undefined,
    role: role === 'all' ? undefined : role,
    limit: PAGE_SIZE,
  };
}

export default function AdminUsersScreen() {
  const theme = useTheme();
  const users = useAdminStore((state) => state.users);
  const loadUsers = useAdminStore((state) => state.loadUsers);
  const setSuspended = useAdminStore((state) => state.setSuspended);

  const [search, setSearch] = useState('');
  const [statusTab, setStatusTab] = useState<StatusTab>('all');
  const [roleTab, setRoleTab] = useState<RoleTab>('all');
  const [loadError, setLoadError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [suspending, setSuspending] = useState<AdminUser | null>(null);

  // re-runs when any filter changes; the cleanup cancels the timer if the
  // admin is still typing, so only the last keystroke actually searches
  useEffect(() => {
    const timer = setTimeout(() => {
      void loadUsers(toQuery(search, statusTab, roleTab))
        .then(() => setLoadError(null))
        .catch((err) => setLoadError(getErrorMessage(err)));
    }, SEARCH_DELAY_MS);
    return () => clearTimeout(timer);
  }, [search, statusTab, roleTab, loadUsers]);

  function clearFilters() {
    setSearch('');
    setStatusTab('all');
    setRoleTab('all');
  }

  async function changeSuspension(user: AdminUser, suspended: boolean, reason?: string) {
    setActionError(null);
    setBusyId(user.id);
    try {
      await setSuspended(user.id, suspended, reason);
      setSuspending(null);
    } catch (err) {
      setActionError(getErrorMessage(err));
    } finally {
      setBusyId(null);
    }
  }

  const subtitle = users
    ? `${users.counts.all} users · ${users.items.length} shown · ${users.counts.suspended} suspended`
    : 'Loading…';

  return (
    <View style={styles.flex}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.titleRow}>
          <View style={styles.grow}>
            <ThemedText type="title" style={styles.title}>
              Users
            </ThemedText>
            <ThemedText themeColor="textSecondary">{subtitle}</ThemedText>
          </View>
          <ThemedText type="small" themeColor="textSecondary">
            Sorted by name
          </ThemedText>
        </View>

        <View style={styles.filters}>
          <View style={[styles.search, { backgroundColor: theme.backgroundElement }]}>
            <SymbolView name={Icons.search} size={16} tintColor={theme.textSecondary} />
            <TextInput
              value={search}
              onChangeText={setSearch}
              placeholder="Search name or email"
              placeholderTextColor={theme.placeholder}
              style={[styles.searchInput, { color: theme.text }]}
            />
          </View>
          <View style={styles.statusTabs}>
            <FilterTabs tabs={STATUS_TABS} value={statusTab} onChange={setStatusTab} />
          </View>
          <View style={styles.roleTabs}>
            <FilterTabs tabs={ROLE_TABS} value={roleTab} onChange={setRoleTab} />
          </View>
        </View>

        {loadError && <Banner message={loadError} />}
        {actionError && <Banner message={actionError} />}

        <View style={[styles.tableCard, { backgroundColor: theme.background, borderColor: theme.border }]}>
          <HeaderRow />

          {users === null && !loadError && (
            <>
              {Array.from({ length: 8 }).map((_, index) => (
                <SkeletonRow key={index} />
              ))}
              <View style={styles.loadingLine}>
                <ActivityIndicator color={theme.primary} />
                <ThemedText themeColor="textSecondary">Loading users…</ThemedText>
              </View>
            </>
          )}

          {users !== null && users.items.length === 0 && (
            <View style={styles.emptyState}>
              <View style={[styles.emptyIcon, { backgroundColor: theme.backgroundElement }]}>
                <SymbolView name={Icons.searchOff} size={24} tintColor={theme.textSecondary} />
              </View>
              <ThemedText type="smallBold" style={styles.emptyTitle}>
                No users match these filters
              </ThemedText>
              <ThemedText themeColor="textSecondary">
                Try a different name or email, or clear the filters.
              </ThemedText>
              <Button label="Clear filters" variant="text" onPress={clearFilters} />
            </View>
          )}

          {users?.items.map((user) => (
            <UserRow
              key={user.id}
              user={user}
              busy={busyId === user.id}
              onSuspend={() => setSuspending(user)}
              onReinstate={() => void changeSuspension(user, false)}
            />
          ))}
        </View>
      </ScrollView>

      {/* a new key per user gives the dialog fresh state, so the reason box starts empty */}
      <SuspendDialog
        key={suspending?.id ?? 'closed'}
        user={suspending}
        busy={suspending !== null && busyId === suspending.id}
        onCancel={() => setSuspending(null)}
        onConfirm={(reason) => suspending && void changeSuspension(suspending, true, reason)}
      />
    </View>
  );
}

function HeaderRow() {
  const theme = useTheme();
  const cell = (label: string, flex: number) => (
    <ThemedText type="smallBold" themeColor="textSecondary" style={{ flex }}>
      {label}
    </ThemedText>
  );
  return (
    <View style={[styles.row, styles.headerRow, { backgroundColor: theme.backgroundElement, borderBottomColor: theme.border }]}>
      {cell('User', COLUMN_FLEX.user)}
      {cell('Trust Score', COLUMN_FLEX.trust)}
      {cell('Role', COLUMN_FLEX.role)}
      {cell('Verification', COLUMN_FLEX.verification)}
      {cell('Account', COLUMN_FLEX.account)}
      <ThemedText type="smallBold" themeColor="textSecondary" style={[styles.action, styles.right]}>
        Action
      </ThemedText>
    </View>
  );
}

// label + tone; "Unverified" = never submitted NIC/LinkedIn
function verificationBadge(user: AdminUser): { label: string; tone: BadgeTone } {
  if (!user.verification.submitted) return { label: 'Unverified', tone: 'neutral' };
  const overall = getOverallVerificationStatus(
    user.verification.identityStatus,
    user.verification.workplaceStatus,
  );
  if (overall === VerificationStatus.VERIFIED) return { label: 'Verified', tone: 'verified' };
  if (overall === VerificationStatus.REJECTED) return { label: 'Rejected', tone: 'rejected' };
  return { label: 'Pending', tone: 'pending' };
}

function UserRow({
  user,
  busy,
  onSuspend,
  onReinstate,
}: {
  user: AdminUser;
  busy: boolean;
  onSuspend: () => void;
  onReinstate: () => void;
}) {
  const theme = useTheme();
  const badge = verificationBadge(user);
  const isAdmin = user.role === UserRole.ADMIN;

  return (
    <View style={[styles.row, { borderBottomColor: theme.border }]}>
      <View style={[styles.userCell, { flex: COLUMN_FLEX.user }]}>
        <Avatar name={user.name} size={36} />
        <View style={styles.grow}>
          <ThemedText type="smallBold" numberOfLines={1}>
            {user.name}
          </ThemedText>
          <ThemedText type="small" themeColor="textSecondary" numberOfLines={1}>
            {user.email}
          </ThemedText>
        </View>
      </View>

      <ThemedText type="small" style={{ flex: COLUMN_FLEX.trust }}>
        {user.trustScore ?? '—'}
      </ThemedText>

      <View style={{ flex: COLUMN_FLEX.role }}>
        <View style={[styles.rolePill, { borderColor: theme.border }]}>
          <ThemedText type="small">{ROLE_LABEL[user.role]}</ThemedText>
        </View>
      </View>

      <View style={{ flex: COLUMN_FLEX.verification }}>
        <StatusBadge label={badge.label} tone={badge.tone} />
      </View>

      <View style={{ flex: COLUMN_FLEX.account }}>
        {user.suspended ? (
          <>
            <ThemedText type="smallBold" themeColor="error">
              Suspended
            </ThemedText>
            <ThemedText type="small" themeColor="textSecondary" numberOfLines={1}>
              {user.suspendedAt ? `Suspended ${formatDate(user.suspendedAt)}` : ''}
            </ThemedText>
          </>
        ) : (
          <>
            <ThemedText type="smallBold">Active</ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              Joined {formatTimeAgo(user.createdAt)}
            </ThemedText>
          </>
        )}
      </View>

      <View style={[styles.action, styles.actionCell]}>
        {isAdmin ? (
          <ThemedText themeColor="textSecondary">—</ThemedText>
        ) : user.suspended ? (
          <Button label="Reinstate" variant="text" loading={busy} onPress={onReinstate} />
        ) : (
          <Button label="Suspend" variant="soft" loading={busy} onPress={onSuspend} />
        )}
      </View>
    </View>
  );
}

// suspending needs a reason (it goes into the audit log)
function SuspendDialog({
  user,
  busy,
  onCancel,
  onConfirm,
}: {
  user: AdminUser | null;
  busy: boolean;
  onCancel: () => void;
  onConfirm: (reason: string) => void;
}) {
  const theme = useTheme();
  const [reason, setReason] = useState('');

  return (
    <Modal visible={user !== null} transparent animationType="fade" onRequestClose={onCancel}>
      <View style={styles.backdrop}>
        <View style={[styles.dialog, { backgroundColor: theme.background }]}>
          <ThemedText style={styles.dialogTitle}>Suspend {user?.name}?</ThemedText>
          <ThemedText themeColor="textSecondary">
            They&apos;re signed out straight away and their active rides are paused. You can
            reinstate them later.
          </ThemedText>
          <TextField
            label="Reason"
            value={reason}
            onChangeText={setReason}
            placeholder="e.g. Repeated no-shows after a warning"
            maxLength={500}
            editable={!busy}
            helperText="Saved in the audit log."
          />
          <View style={styles.dialogActions}>
            <Button label="Cancel" variant="text" disabled={busy} onPress={onCancel} />
            <Button
              label="Suspend"
              variant="danger"
              loading={busy}
              disabled={!reason.trim()}
              onPress={() => onConfirm(reason.trim())}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}

function SkeletonRow() {
  const theme = useTheme();
  const bar = (flex: number, width: number) => (
    <View style={{ flex }}>
      <View style={[styles.skeletonBar, { width, backgroundColor: theme.backgroundElement }]} />
    </View>
  );
  return (
    <View style={[styles.row, { borderBottomColor: theme.border }]}>
      <View style={[styles.userCell, { flex: COLUMN_FLEX.user }]}>
        <View style={[styles.skeletonCircle, { backgroundColor: theme.backgroundElement }]} />
        <View style={{ gap: Spacing.one }}>
          <View style={[styles.skeletonBar, { width: 120, backgroundColor: theme.backgroundSelected }]} />
          <View style={[styles.skeletonBar, { width: 170, backgroundColor: theme.backgroundElement }]} />
        </View>
      </View>
      {bar(COLUMN_FLEX.trust, 30)}
      {bar(COLUMN_FLEX.role, 60)}
      {bar(COLUMN_FLEX.verification, 70)}
      {bar(COLUMN_FLEX.account, 100)}
      <View style={styles.action}>
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
  filters: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: Spacing.three,
  },
  search: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    flexGrow: 1,
    minWidth: 260,
    borderRadius: Spacing.three,
    paddingHorizontal: Spacing.three,
  },
  statusTabs: {
    width: 400,
  },
  roleTabs: {
    width: 480,
  },
  searchInput: {
    flex: 1,
    paddingVertical: Spacing.two + 2,
    fontSize: 15,
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
  right: {
    textAlign: 'right',
  },
  userCell: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  rolePill: {
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderRadius: Spacing.three,
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.half,
  },
  action: {
    width: ACTION_WIDTH,
  },
  actionCell: {
    alignItems: 'flex-end',
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
  emptyIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    fontSize: 18,
  },
  skeletonBar: {
    height: 12,
    borderRadius: Spacing.one,
  },
  skeletonCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  skeletonButton: {
    height: 40,
    borderRadius: Spacing.three,
  },
  backdrop: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.4)',
    padding: Spacing.four,
  },
  dialog: {
    width: '100%',
    maxWidth: 460,
    borderRadius: Spacing.four,
    padding: Spacing.four,
    gap: Spacing.three,
  },
  dialogTitle: {
    fontSize: 20,
    lineHeight: 26,
    fontWeight: 700,
  },
  dialogActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: Spacing.two,
  },
});
