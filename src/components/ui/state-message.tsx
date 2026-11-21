import { SymbolView } from 'expo-symbols';
import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Button, type ButtonVariant } from '@/components/ui/button';
import { Icons } from '@/constants/icons';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type Tone = 'primary' | 'error' | 'neutral';

interface StateMessageProps {
  title: string;
  message?: ReactNode;
  icon?: keyof typeof Icons;
  tone?: Tone;
  action?: {
    label: string;
    onPress: () => void;
    variant?: ButtonVariant;
    trailingArrow?: boolean;
  };
  // anything extra between the message and the button, e.g. filter chips
  children?: ReactNode;
}

const ICON_COLORS = {
  primary: { background: 'primarySoft', tint: 'primary' },
  error: { background: 'errorSoft', tint: 'error' },
  neutral: { background: 'backgroundElement', tint: 'textSecondary' },
} as const;

// The one empty / error state used across the app, so they all look the same.
export function StateMessage({
  title,
  message,
  icon,
  tone = 'primary',
  action,
  children,
}: StateMessageProps) {
  const theme = useTheme();
  const colors = ICON_COLORS[tone];

  return (
    <View style={styles.wrap}>
      {icon && (
        <View style={[styles.icon, { backgroundColor: theme[colors.background] }]}>
          <SymbolView name={Icons[icon]} size={28} tintColor={theme[colors.tint]} />
        </View>
      )}
      <ThemedText style={styles.title}>{title}</ThemedText>
      {message && (
        <ThemedText themeColor="textSecondary" style={styles.center}>
          {message}
        </ThemedText>
      )}
      {children}
      {action && (
        <View style={styles.action}>
          <Button
            label={action.label}
            variant={action.variant}
            trailingArrow={action.trailingArrow}
            onPress={action.onPress}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    gap: Spacing.two,
    paddingTop: Spacing.six,
  },
  icon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.two,
  },
  title: {
    fontSize: 20,
    lineHeight: 26,
    fontWeight: 700,
    textAlign: 'center',
  },
  center: {
    textAlign: 'center',
  },
  action: {
    alignSelf: 'stretch',
    paddingTop: Spacing.four,
  },
});
