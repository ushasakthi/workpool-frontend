import type { ReactNode } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, Spacing } from '@/constants/theme';

const HEADER_PADDING_TOP = Spacing.two;
const CONTENT_PADDING_TOP = Spacing.five;
const CONTENT_PADDING_BOTTOM = Spacing.five;
// The app tab bar sits at the bottom on native but is a bar across the top on web
// (see app-tabs.web.tsx) — a screen inside (tabs) has to clear whichever applies.
const TAB_BAR_BOTTOM_INSET = BottomTabInset + Spacing.three;
const TAB_BAR_WEB_TOP_INSET = 68;

interface ScreenProps {
  children: ReactNode;
  /** Persistent app-chrome bar rendered above the scrollable content, not part of it. */
  header?: ReactNode;
  /** Set on screens rendered inside the (tabs) navigator so content clears the tab bar. */
  underTabBar?: boolean;
}

export function Screen({ children, header, underTabBar = false }: ScreenProps) {
  const topInset = underTabBar && Platform.OS === 'web' ? TAB_BAR_WEB_TOP_INSET : 0;
  const bottomInset = underTabBar ? TAB_BAR_BOTTOM_INSET : 0;

  return (
    <ThemedView style={styles.flex}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <SafeAreaView style={styles.flex} edges={['top', 'bottom']}>
          {header && (
            <View style={[styles.header, { paddingTop: HEADER_PADDING_TOP + topInset }]}>{header}</View>
          )}
          <ScrollView
            contentContainerStyle={[
              styles.content,
              !header && { paddingTop: CONTENT_PADDING_TOP + topInset },
              { paddingBottom: CONTENT_PADDING_BOTTOM + bottomInset },
            ]}
            keyboardShouldPersistTaps="handled">
            {children}
          </ScrollView>
        </SafeAreaView>
      </KeyboardAvoidingView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  header: {
    paddingHorizontal: Spacing.four,
    paddingTop: HEADER_PADDING_TOP,
    paddingBottom: Spacing.three,
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: Spacing.four,
    paddingTop: CONTENT_PADDING_TOP,
    paddingBottom: CONTENT_PADDING_BOTTOM,
    gap: Spacing.four,
  },
});
