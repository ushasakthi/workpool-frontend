import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

// Two-segment switch at the top of the rides section. "My rides" is the list
// screen this renders on; "Post a ride" pushes the form.
export function RidesSegment() {
  const theme = useTheme();
  const router = useRouter();

  return (
    <View style={[styles.container, { borderColor: theme.border }]}>
      <View
        accessibilityRole="tab"
        accessibilityState={{ selected: true }}
        style={[styles.segment, { backgroundColor: theme.primary }]}>
        <ThemedText type="smallBold" themeColor="onPrimary">
          My rides
        </ThemedText>
      </View>
      <Pressable
        accessibilityRole="tab"
        accessibilityState={{ selected: false }}
        accessibilityLabel="Post a ride"
        onPress={() => router.push('/rides/post')}
        style={styles.segment}>
        <ThemedText type="smallBold" themeColor="textSecondary">
          Post a ride
        </ThemedText>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderWidth: 1,
    borderRadius: Spacing.five,
    padding: Spacing.half,
    gap: Spacing.half,
  },
  segment: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.two,
    borderRadius: Spacing.five,
  },
});
