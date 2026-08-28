import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

interface BannerProps {
  message: string;
  tone?: 'error' | 'success';
}

export function Banner({ message, tone = 'error' }: BannerProps) {
  const theme = useTheme();

  const backgroundColor = tone === 'error' ? theme.errorSoft : theme.primarySoft;
  const textColor = tone === 'error' ? 'error' : 'primarySoftText';

  return (
    <View style={[styles.banner, { backgroundColor }]}>
      <ThemedText type="small" themeColor={textColor}>
        {message}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    borderRadius: Spacing.three,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
  },
});
