import { SymbolView } from 'expo-symbols';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Icons } from '@/constants/icons';
import { Spacing } from '@/constants/theme';
import { UserRole } from '@/constants/user-role.enum';
import { useTheme } from '@/hooks/use-theme';

interface RoleChoiceProps {
  value: UserRole;
  onChange: (role: UserRole) => void;
}

// The three self-assignable account roles (backend blocks `admin`).
const OPTIONS: { value: UserRole; label: string; icon: keyof typeof Icons }[] = [
  { value: UserRole.PASSENGER, label: 'Find rides', icon: 'personCircle' },
  { value: UserRole.DRIVER, label: 'Offer rides', icon: 'car' },
  { value: UserRole.BOTH, label: 'Both', icon: 'people' },
];

export function RoleChoice({ value, onChange }: RoleChoiceProps) {
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
            accessibilityLabel={option.label}
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
            <ThemedText
              type="smallBold"
              themeColor={selected ? 'primary' : 'textSecondary'}>
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
