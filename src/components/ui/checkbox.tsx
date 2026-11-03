import { SymbolView } from 'expo-symbols';
import type { ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Icons } from '@/constants/icons';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

interface CheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  children: ReactNode;
  disabled?: boolean;
}

export function Checkbox({ checked, onChange, children, disabled = false }: CheckboxProps) {
  const theme = useTheme();

  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityState={{ checked, disabled }}
      disabled={disabled}
      onPress={() => onChange(!checked)}
      style={[styles.row, disabled && styles.disabled]}>
      <View
        style={[
          styles.box,
          {
            borderColor: checked ? theme.primary : theme.border,
            backgroundColor: checked ? theme.primary : 'transparent',
          },
        ]}>
        {checked && <SymbolView name={Icons.check} size={14} weight="bold" tintColor={theme.onPrimary} />}
      </View>
      <ThemedText type="small" themeColor="textSecondary" style={styles.label}>
        {children}
      </ThemedText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.two,
  },
  box: {
    width: 20,
    height: 20,
    borderRadius: Spacing.one,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  label: {
    flex: 1,
  },
  disabled: {
    opacity: 0.5,
  },
});
