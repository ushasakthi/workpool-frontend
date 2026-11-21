import { SymbolView } from 'expo-symbols';
import { StyleSheet, View } from 'react-native';

import { Icons } from '@/constants/icons';
import { useTheme } from '@/hooks/use-theme';

export type StatusIconVariant = 'neutral' | 'success' | 'error';

interface StatusIconProps {
  variant: StatusIconVariant;
  icon: keyof typeof Icons;
  size?: number;
}

export function StatusIcon({ variant, icon, size = 64 }: StatusIconProps) {
  const theme = useTheme();

  const backgroundColor: Record<StatusIconVariant, string> = {
    neutral: theme.backgroundElement,
    success: theme.primarySoft,
    error: theme.errorSoft,
  };
  const tintColor: Record<StatusIconVariant, string> = {
    neutral: theme.text,
    success: theme.primary,
    error: theme.error,
  };

  return (
    <View
      style={[
        styles.circle,
        { width: size, height: size, borderRadius: size / 2, backgroundColor: backgroundColor[variant] },
      ]}>
      <SymbolView name={Icons[icon]} size={size * 0.45} tintColor={tintColor[variant]} />
    </View>
  );
}

const styles = StyleSheet.create({
  circle: {
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
  },
});
