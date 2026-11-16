import { SymbolView } from 'expo-symbols';
import { Pressable, StyleSheet, View } from 'react-native';

import { SosButton } from '@/components/bookings/sos-button';
import { ThemedText } from '@/components/themed-text';
import { Icons } from '@/constants/icons';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

interface TripHeaderProps {
  title: string;
  onClose: () => void;
  // hidden when there's no booking to attach the alert to
  onSos?: () => void;
}

export function TripHeader({ title, onClose, onSos }: TripHeaderProps) {
  const theme = useTheme();
  return (
    <View style={styles.row}>
      <Pressable accessibilityRole="button" accessibilityLabel="Close" onPress={onClose} hitSlop={8}>
        <SymbolView name={Icons.close} size={22} tintColor={theme.text} />
      </Pressable>
      <ThemedText type="smallBold" style={styles.title}>
        {title}
      </ThemedText>
      {onSos ? <SosButton onPress={onSos} /> : <View style={styles.spacer} />}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.three,
  },
  title: {
    fontSize: 16,
  },
  spacer: {
    width: 60,
  },
});
