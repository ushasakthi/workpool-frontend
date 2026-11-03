import { SymbolView } from 'expo-symbols';
import { Tabs, TabList, TabSlot, TabTrigger, TabTriggerSlotProps, TabListProps } from 'expo-router/ui';
import { Pressable, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from './themed-text';
import { ThemedView } from './themed-view';

import { Icons } from '@/constants/icons';
import { BottomTabInset, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

// Using JS Tabs because native tabs crash on iOS 26
// (software-mansion/react-native-screens#4176)
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
          <TabTrigger name="rides" href="/rides/my-rides" asChild>
            <TabButton icon="car">Rides</TabButton>
          </TabTrigger>
          <TabTrigger name="bookings" href="/bookings" asChild>
            <TabButton icon="calendar">Bookings</TabButton>
          </TabTrigger>
          <TabTrigger name="profile" href="/profile" asChild>
            <TabButton icon="personCircle">Profile</TabButton>
          </TabTrigger>
        </AppTabBar>
      </TabList>
    </Tabs>
  );
}

type TabButtonProps = TabTriggerSlotProps & { icon: keyof typeof Icons };

function TabButton({ children, isFocused, icon, ...props }: TabButtonProps) {
  const theme = useTheme();
  const tintColor = isFocused ? theme.text : theme.textSecondary;

  return (
    <Pressable {...props} style={styles.tabButton}>
      <SymbolView name={Icons[icon]} size={22} tintColor={tintColor} />
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
});
