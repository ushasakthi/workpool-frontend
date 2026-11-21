import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

interface PinBoxProps {
  label: string;
  pin: string;
  // Home card uses the smaller size
  size?: 'large' | 'medium';
}

export function PinBox({ label, pin, size = 'large' }: PinBoxProps) {
  const theme = useTheme();
  return (
    <View style={[styles.box, { backgroundColor: theme.primarySoft }]}>
      <ThemedText type="smallBold" themeColor="primarySoftText" style={styles.label}>
        {label}
      </ThemedText>
      <ThemedText
        themeColor="primarySoftText"
        style={size === 'large' ? styles.large : styles.medium}>
        {pin.split('').join('  ')}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    alignItems: 'center',
    gap: Spacing.one,
    borderRadius: Spacing.three,
    padding: Spacing.three,
  },
  label: {
    fontSize: 11,
    letterSpacing: 0.7,
  },
  large: {
    fontSize: 44,
    lineHeight: 52,
    fontWeight: 800,
  },
  medium: {
    fontSize: 32,
    lineHeight: 40,
    fontWeight: 800,
  },
});
