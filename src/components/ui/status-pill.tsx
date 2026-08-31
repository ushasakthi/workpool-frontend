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
  tone?: 'primary' | 'neutral';
  style?: StyleProp<ViewStyle>;
}

export function StatusPill({ label, showCheck = false, icon, tone = 'primary', style }: StatusPillProps) {
  const theme = useTheme();

  const backgroundColor = tone === 'primary' ? theme.primarySoft : theme.backgroundElement;
  const textColor = tone === 'primary' ? 'primarySoftText' : 'textSecondary';
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
