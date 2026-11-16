import { SymbolView } from 'expo-symbols';
import { ActivityIndicator, Pressable, StyleSheet, Text } from 'react-native';

import { Spacing } from '@/constants/theme';
import { Icons } from '@/constants/icons';
import { useTheme } from '@/hooks/use-theme';

export type ButtonVariant = 'primary' | 'soft' | 'text' | 'danger';

interface ButtonProps {
  label: string;
  onPress?: () => void;
  variant?: ButtonVariant;
  disabled?: boolean;
  loading?: boolean;
  trailingArrow?: boolean;
  // shown before the label, e.g. "play" for Start trip
  icon?: keyof typeof Icons;
}

export function Button({
  label,
  onPress,
  variant = 'primary',
  disabled = false,
  loading = false,
  trailingArrow = false,
  icon,
}: ButtonProps) {
  const theme = useTheme();
  const isDisabled = disabled || loading;

  const backgroundColor: Record<ButtonVariant, string> = {
    primary: theme.primary,
    soft: theme.primarySoft,
    text: 'transparent',
    danger: theme.error,
  };
  const textColor: Record<ButtonVariant, string> = {
    primary: theme.onPrimary,
    soft: theme.primarySoftText,
    text: theme.primary,
    danger: theme.onPrimary,
  };

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      // also marks it disabled for screen readers on web (aria-disabled)
      disabled={isDisabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        { backgroundColor: backgroundColor[variant] },
        variant === 'text' && styles.textVariant,
        pressed && !isDisabled && variant === 'primary' && { backgroundColor: theme.primaryPressed },
        pressed && !isDisabled && variant !== 'primary' && styles.pressedOpacity,
        isDisabled && styles.disabled,
      ]}>
      {loading ? (
        <ActivityIndicator color={textColor[variant]} />
      ) : (
        <>
          {icon && <SymbolView name={Icons[icon]} size={18} tintColor={textColor[variant]} />}
          <Text style={[styles.label, { color: textColor[variant] }]}>{label}</Text>
          {trailingArrow && (
            <SymbolView name={Icons.arrowRight} size={16} weight="semibold" tintColor={textColor[variant]} />
          )}
        </>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    borderRadius: Spacing.three,
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.four,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.two,
    minHeight: 52,
  },
  textVariant: {
    paddingVertical: Spacing.two,
    minHeight: undefined,
  },
  label: {
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
  },
  pressedOpacity: {
    opacity: 0.8,
  },
  disabled: {
    opacity: 0.6,
  },
});
