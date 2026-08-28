import { SymbolView } from 'expo-symbols';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Icons } from '@/constants/icons';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

interface StatusPillProps {
  label: string;
  showCheck?: boolean;
}

export function StatusPill({ label, showCheck = false }: StatusPillProps) {
  const theme = useTheme();

  return (
    <View style={[styles.pill, { backgroundColor: theme.primarySoft }]}>
      {showCheck && <SymbolView name={Icons.checkCircle} size={14} tintColor={theme.primarySoftText} />}
      <ThemedText type="smallBold" themeColor="primarySoftText">
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
