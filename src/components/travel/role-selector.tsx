import { SymbolView } from 'expo-symbols';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Icons } from '@/constants/icons';
import { PreferredRole } from '@/constants/preferred-role.enum';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

interface RoleSelectorProps {
  value?: PreferredRole;
  onChange: (role: PreferredRole) => void;
}

const OPTIONS: { value: PreferredRole; label: string; icon: keyof typeof Icons }[] = [
  { value: PreferredRole.DRIVER, label: 'Driver', icon: 'car' },
  { value: PreferredRole.PASSENGER, label: 'Passenger', icon: 'personCircle' },
  { value: PreferredRole.EITHER, label: 'Either', icon: 'people' },
];

export function RoleSelector({ value, onChange }: RoleSelectorProps) {
  const theme = useTheme();

  return (
    <View style={styles.row}>
      {OPTIONS.map((option) => {
        const selected = option.value === value;
        return (
          <Pressable
            key={option.value}
            accessibilityRole="radio"
            accessibilityState={{ selected }}
            onPress={() => onChange(option.value)}
            style={[
              styles.card,
              { borderColor: selected ? theme.primary : theme.border },
              selected && { backgroundColor: theme.primarySoft },
            ]}>
            <SymbolView
              name={Icons[option.icon]}
              size={20}
              tintColor={selected ? theme.primary : theme.textSecondary}
            />
            <ThemedText type="smallBold" themeColor={selected ? 'primary' : 'textSecondary'}>
              {option.label}
            </ThemedText>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  card: {
    flex: 1,
    borderWidth: 1.5,
    borderRadius: Spacing.three,
    paddingVertical: Spacing.three,
    alignItems: 'center',
    gap: Spacing.one,
  },
});
