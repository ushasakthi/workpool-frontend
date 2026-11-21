import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

interface AvatarProps {
  name: string;
  size?: number;
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  // one-word names get one letter, not the same letter twice
  const initials = [parts[0]?.[0], parts.length > 1 ? parts[parts.length - 1][0] : undefined].filter(Boolean);
  return initials.join('').toUpperCase() || '?';
}

export function Avatar({ name, size = 32 }: AvatarProps) {
  const theme = useTheme();

  return (
    <View
      style={[
        styles.circle,
        { width: size, height: size, borderRadius: size / 2, backgroundColor: theme.backgroundSelected },
      ]}>
      <ThemedText type="smallBold" themeColor="textSecondary">
        {getInitials(name)}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  circle: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.half,
  },
});
