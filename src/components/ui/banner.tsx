import { SymbolView } from 'expo-symbols';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Icons } from '@/constants/icons';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

interface BannerProps {
  message: string;
  tone?: 'error' | 'success';
  icon?: keyof typeof Icons;
}

export function Banner({ message, tone = 'error', icon }: BannerProps) {
  const theme = useTheme();

  const backgroundColor = tone === 'error' ? theme.errorSoft : theme.primarySoft;
  const textColor = tone === 'error' ? 'error' : 'primarySoftText';

  return (
    <View style={[styles.banner, { backgroundColor }, icon && styles.withIcon]}>
      {icon && <SymbolView name={Icons[icon]} size={16} tintColor={theme[textColor]} />}
      <ThemedText type="small" themeColor={textColor} style={icon && styles.messageWithIcon}>
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
  withIcon: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.two,
  },
  messageWithIcon: {
    flex: 1,
  },
});
