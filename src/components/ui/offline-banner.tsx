import { SymbolView } from 'expo-symbols';
import { useState } from 'react';
import { ActivityIndicator, Platform, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { getHealth } from '@/api/health.api';
import { ThemedText } from '@/components/themed-text';
import { Icons } from '@/constants/icons';
import { BottomTabInset, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useConnectionStore } from '@/stores/useConnectionStore';

// Floats above the tab bar whenever the API can't be reached. It hides itself
// as soon as any request succeeds (the API client clears the flag).
export function OfflineBanner() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const offline = useConnectionStore((state) => state.offline);
  const [checking, setChecking] = useState(false);

  if (!offline) return null;

  async function checkAgain() {
    setChecking(true);
    try {
      await getHealth();
    } catch {
      // still offline: the client keeps the banner up
    } finally {
      setChecking(false);
    }
  }

  // the tab bar is at the bottom on phones, at the top on web
  const bottom = insets.bottom + (Platform.OS === 'web' ? Spacing.three : BottomTabInset + Spacing.three);

  return (
    <View pointerEvents="box-none" style={[styles.wrap, { bottom }]}>
      <View accessibilityRole="alert" style={[styles.banner, { backgroundColor: theme.text }]}>
        <SymbolView name={Icons.wifiSlash} size={18} tintColor={theme.background} />
        <ThemedText type="small" style={[styles.grow, { color: theme.background }]}>
          You&apos;re offline. Some information may be out of date.
        </ThemedText>
        <Pressable accessibilityRole="button" onPress={() => void checkAgain()} disabled={checking} hitSlop={8}>
          {checking ? (
            <ActivityIndicator size="small" color={theme.background} />
          ) : (
            <ThemedText type="smallBold" style={{ color: theme.background }}>
              Try again
            </ThemedText>
          )}
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    left: Spacing.three,
    right: Spacing.three,
    alignItems: 'center',
  },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    width: '100%',
    maxWidth: 520,
    borderRadius: Spacing.three,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two + 2,
  },
  grow: {
    flex: 1,
  },
});
