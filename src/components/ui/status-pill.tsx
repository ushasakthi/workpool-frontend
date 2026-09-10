import { SymbolView } from 'expo-symbols';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Icons } from '@/constants/icons';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

interface StatusPillProps {
  label: string;
  showCheck?: boolean;
  icon?: keyof typeof Icons;
  tone?: 'primary' | 'neutral' | 'danger';
  style?: StyleProp<ViewStyle>;
}

const BACKGROUND_BY_TONE = {
  primary: 'primarySoft',
  neutral: 'backgroundElement',
  danger: 'errorSoft',
} as const;

const TEXT_BY_TONE = {
  primary: 'primarySoftText',
  neutral: 'textSecondary',
  danger: 'error',
} as const;

export function StatusPill({ label, showCheck = false, icon, tone = 'primary', style }: StatusPillProps) {
  const theme = useTheme();

  const backgroundColor = theme[BACKGROUND_BY_TONE[tone]];
  const textColor = TEXT_BY_TONE[tone];
  const iconKey = showCheck ? 'checkCircle' : icon;

  return (
    <View style={[styles.pill, { backgroundColor }, style]}>
      {iconKey && <SymbolView name={Icons[iconKey]} size={14} tintColor={theme[textColor]} />}
      <ThemedText type="smallBold" themeColor={textColor}>
        {label}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
    alignSelf: 'flex-start',
    borderRadius: Spacing.five,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.one,
  },
});
