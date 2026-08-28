import { Image } from 'expo-image';
import { Tabs, TabList, TabSlot, TabTrigger, TabTriggerSlotProps, TabListProps } from 'expo-router/ui';
import { Pressable, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from './themed-text';
import { ThemedView } from './themed-view';

import { BottomTabInset, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

// expo-router/unstable-native-tabs crashes on iOS 26 (async icon load racing a
// tab-bar rebuild — see software-mansion/react-native-screens#4176), so tabs are
// rendered with the stable JS-based Tabs API instead, same as the web fallback.
const tabIcons = {
  home: require('@/assets/images/tabIcons/home.png'),
  explore: require('@/assets/images/tabIcons/explore.png'),
} as const;

export default function AppTabs() {
  return (
    <Tabs style={styles.tabs}>
      <TabSlot />
      <TabList asChild>
        <AppTabBar>
          <TabTrigger name="home" href="/" asChild>
            <TabButton icon="home">Home</TabButton>
          </TabTrigger>
          <TabTrigger name="explore" href="/explore" asChild>
            <TabButton icon="explore">Explore</TabButton>
          </TabTrigger>
          {/* Icons pending the design step — labels only for now. */}
          <TabTrigger name="rides" href="/rides/search" asChild>
            <TabButton>Rides</TabButton>
          </TabTrigger>
          <TabTrigger name="bookings" href="/bookings" asChild>
            <TabButton>Bookings</TabButton>
          </TabTrigger>
          <TabTrigger name="profile" href="/profile" asChild>
            <TabButton>Profile</TabButton>
          </TabTrigger>
        </AppTabBar>
      </TabList>
    </Tabs>
  );
}

type TabButtonProps = TabTriggerSlotProps & { icon?: keyof typeof tabIcons };

function TabButton({ children, isFocused, icon, ...props }: TabButtonProps) {
  const theme = useTheme();
  const tintColor = isFocused ? theme.text : theme.textSecondary;

  return (
    <Pressable {...props} style={styles.tabButton}>
      {icon && <Image source={tabIcons[icon]} tintColor={tintColor} style={styles.icon} />}
      <ThemedText type="small" themeColor={isFocused ? 'text' : 'textSecondary'}>
        {children}
      </ThemedText>
    </Pressable>
  );
}

function AppTabBar(props: TabListProps) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <ThemedView
      {...props}
      style={[
        styles.bar,
        { height: BottomTabInset + insets.bottom, paddingBottom: insets.bottom, borderTopColor: theme.border },
      ]}
    />
  );
}

const styles = StyleSheet.create({
  tabs: {
    flex: 1,
  },
  bar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.half,
  },
  icon: {
    width: 24,
    height: 24,
  },
});
