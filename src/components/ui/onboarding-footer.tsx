import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export function OnboardingFooter() {
  const theme = useTheme();

  return (
    <View style={[styles.container, { borderTopColor: theme.border }]}>
      <ThemedText type="small" themeColor="textSecondary" style={styles.text}>
        WorkPool — cost-sharing rides for verified professionals
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderTopWidth: 1,
    paddingTop: Spacing.three,
  },
  text: {
    textAlign: 'center',
  },
});
