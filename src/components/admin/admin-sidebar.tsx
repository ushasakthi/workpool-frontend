import { Link, usePathname } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Icons } from '@/constants/icons';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useAdminStore } from '@/stores/useAdminStore';

const SIDEBAR_WIDTH = 264;

interface NavItem {
  href: '/home' | '/verifications' | '/reports' | '/users' | '/audit-log';
  label: string;
  icon: keyof typeof Icons;
}

const NAV: NavItem[] = [
  { href: '/home', label: 'Dashboard', icon: 'dashboard' },
  { href: '/verifications', label: 'Verification queue', icon: 'shieldCheck' },
  { href: '/reports', label: 'Reports', icon: 'flag' },
  { href: '/users', label: 'Users', icon: 'people' },
  { href: '/audit-log', label: 'Audit log', icon: 'history' },
];

export function AdminSidebar() {
  const theme = useTheme();
  const pathname = usePathname();
  const stats = useAdminStore((state) => state.stats);
  // the reports screen's live list is newer than the stats when it's loaded
  const openReports = useAdminStore((state) => state.openReports?.length);

  const counts: Partial<Record<NavItem['href'], number>> = {
    '/verifications': stats?.pendingVerifications,
    '/reports': openReports ?? stats?.openReports,
  };

  function isActive(href: string) {
    return pathname === href || pathname.startsWith(`${href}/`);
  }

  function renderItem(item: NavItem) {
    const active = isActive(item.href);
    const count = counts[item.href];
    // Link asChild needs one style object, not an array
    const navItemStyle = StyleSheet.flatten([styles.navItem, active && { backgroundColor: theme.primarySoft }]);

    return (
      // replace, not push: switching sections shouldn't stack up copies of screens
      <Link key={item.href} href={item.href} replace asChild>
        <Pressable style={navItemStyle}>
          <SymbolView
            name={Icons[item.icon]}
            size={18}
            tintColor={active ? theme.primary : theme.textSecondary}
          />
          <ThemedText
            type="smallBold"
            themeColor={active ? 'primary' : 'textSecondary'}
            style={styles.grow}>
            {item.label}
          </ThemedText>
          {count !== undefined && (
            <ThemedText type="smallBold" themeColor={active ? 'primary' : 'textSecondary'}>
              {count}
            </ThemedText>
          )}
        </Pressable>
      </Link>
    );
  }

  return (
    <View style={[styles.sidebar, { backgroundColor: theme.background, borderRightColor: theme.border }]}>
      <View style={styles.brandRow}>
        <View style={[styles.badge, { backgroundColor: theme.primary }]}>
          <ThemedText type="smallBold" themeColor="onPrimary">
            WP
          </ThemedText>
        </View>
        <View>
          <ThemedText type="smallBold">WorkPool</ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            Admin console
          </ThemedText>
        </View>
      </View>

      <View style={styles.navGroup}>{NAV.map(renderItem)}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  sidebar: {
    width: SIDEBAR_WIDTH,
    borderRightWidth: 1,
    padding: Spacing.four,
    gap: Spacing.five,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  badge: {
    width: 36,
    height: 36,
    borderRadius: Spacing.two,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navGroup: {
    gap: Spacing.one,
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: Spacing.three,
  },
  grow: {
    flex: 1,
  },
});
