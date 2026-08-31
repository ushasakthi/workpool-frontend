import { Link, usePathname } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Icons } from '@/constants/icons';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

const SIDEBAR_WIDTH = 240;

interface NavItem {
  href: '/home' | '/verifications' | '/passengers' | '/riders' | '/report' | '/account' | '/settings';
  label: string;
  icon: keyof typeof Icons;
}

const MAIN_NAV: NavItem[] = [
  { href: '/home', label: 'Home', icon: 'dashboard' },
  { href: '/verifications', label: 'Verifications', icon: 'shieldCheck' },
  { href: '/passengers', label: 'Passengers', icon: 'people' },
  { href: '/riders', label: 'Riders', icon: 'car' },
  { href: '/report', label: 'Report', icon: 'barChart' },
];

const SECONDARY_NAV: NavItem[] = [
  { href: '/account', label: 'My profile', icon: 'personCircle' },
  { href: '/settings', label: 'Settings', icon: 'settingsGear' },
];

export function AdminSidebar() {
  const theme = useTheme();
  const pathname = usePathname();

  function isActive(href: string) {
    return pathname === href || pathname.startsWith(`${href}/`);
  }

  function renderItem(item: NavItem) {
    const active = isActive(item.href);
    // Link's asChild clones this child via expo-router's <Slot>, which expects a single
    // flattened style object rather than an array — flatten before handing it off.
    const navItemStyle = StyleSheet.flatten([styles.navItem, active && { backgroundColor: theme.primarySoft }]);

    return (
      <Link key={item.href} href={item.href} asChild>
        <Pressable style={navItemStyle}>
          <SymbolView
            name={Icons[item.icon]}
            size={18}
            tintColor={active ? theme.primary : theme.textSecondary}
          />
          <ThemedText type="smallBold" themeColor={active ? 'primary' : 'textSecondary'}>
            {item.label}
          </ThemedText>
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
        <View style={styles.wordmarkRow}>
          <ThemedText type="smallBold">WorkPool</ThemedText>
          <ThemedText type="smallBold" themeColor="textSecondary">
            Admin
          </ThemedText>
        </View>
      </View>

      <View style={styles.navGroup}>{MAIN_NAV.map(renderItem)}</View>

      <View style={[styles.divider, { backgroundColor: theme.border }]} />

      <View style={styles.navGroup}>{SECONDARY_NAV.map(renderItem)}</View>
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
    width: 32,
    height: 32,
    borderRadius: Spacing.two,
    alignItems: 'center',
    justifyContent: 'center',
  },
  wordmarkRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: Spacing.one,
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
  divider: {
    height: 1,
  },
});
