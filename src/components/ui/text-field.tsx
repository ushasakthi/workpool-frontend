import { SymbolView } from 'expo-symbols';
import { type ReactNode, useState } from 'react';
import { Pressable, StyleSheet, TextInput, type TextInputProps, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Icons } from '@/constants/icons';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

interface TextFieldProps extends Omit<TextInputProps, 'style' | 'placeholderTextColor'> {
  label: string;
  labelRight?: ReactNode;
  error?: string;
  helperText?: string;
  isPassword?: boolean;
}

export function TextField({
  label,
  labelRight,
  error,
  helperText,
  isPassword = false,
  onFocus,
  onBlur,
  ...inputProps
}: TextFieldProps) {
  const theme = useTheme();
  const [isFocused, setIsFocused] = useState(false);
  const [isRevealed, setIsRevealed] = useState(false);

  const hideText = isPassword && !isRevealed;

  return (
    <View style={styles.container}>
      <View style={styles.labelRow}>
        <ThemedText type="smallBold">{label}</ThemedText>
        {labelRight}
      </View>
      <View
        style={[
          styles.inputRow,
          { backgroundColor: theme.backgroundElement, borderColor: 'transparent' },
          isFocused && !error && { borderColor: theme.primary },
          error && { borderColor: theme.error },
        ]}>
        <TextInput
          {...inputProps}
          secureTextEntry={hideText}
          placeholderTextColor={theme.placeholder}
          onFocus={(event) => {
            setIsFocused(true);
            onFocus?.(event);
          }}
          onBlur={(event) => {
            setIsFocused(false);
            onBlur?.(event);
          }}
          style={[styles.input, { color: theme.text }]}
        />
        {isPassword && (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={isRevealed ? 'Hide password' : 'Show password'}
            onPress={() => setIsRevealed((value) => !value)}
            hitSlop={8}>
            <SymbolView
              name={isRevealed ? Icons.eyeHide : Icons.eyeShow}
              size={18}
              tintColor={theme.textSecondary}
            />
          </Pressable>
        )}
      </View>
      {(error ?? helperText) && (
        <ThemedText type="small" themeColor={error ? 'error' : 'textSecondary'}>
          {error ?? helperText}
        </ThemedText>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.two,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: Spacing.three,
    borderWidth: 1.5,
    paddingHorizontal: Spacing.three,
    gap: Spacing.two,
  },
  input: {
    flex: 1,
    fontSize: 16,
    paddingVertical: Spacing.three,
    // On web this renders as a real <input> — suppress the browser's own focus ring since
    // inputRow already shows focus via its border color.
    outlineWidth: 0,
  },
});
