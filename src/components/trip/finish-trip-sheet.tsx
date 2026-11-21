import { SymbolView } from 'expo-symbols';
import { Modal, Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { Icons } from '@/constants/icons';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

interface FinishTripSheetProps {
  visible: boolean;
  pickedUp: number;
  // first names of riders still waiting
  missed: string[];
  finishing: boolean;
  error: string | null;
  onFinish: () => void;
  onCancel: () => void;
}

// bottom sheet asking the driver to confirm, with a warning if someone wasn't picked up
export function FinishTripSheet({
  visible,
  pickedUp,
  missed,
  finishing,
  error,
  onFinish,
  onCancel,
}: FinishTripSheetProps) {
  const theme = useTheme();

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onCancel}>
      <Pressable accessibilityLabel="Close" style={styles.backdrop} onPress={onCancel} />
      <View style={[styles.sheet, { backgroundColor: theme.background }]}>
        <View style={[styles.handle, { backgroundColor: theme.border }]} />
        <ThemedText style={styles.title}>Finish trip?</ThemedText>
        <ThemedText themeColor="textSecondary">
          {pickedUp === 0
            ? 'Nobody was picked up on this trip.'
            : `${pickedUp} rider${pickedUp === 1 ? '' : 's'} will be marked as completed and asked to rate the trip.`}
        </ThemedText>

        {missed.length > 0 && (
          <View style={[styles.warning, { backgroundColor: theme.warningSoft }]}>
            <SymbolView name={Icons.warningTriangle} size={18} tintColor={theme.warning} />
            <ThemedText type="smallBold" themeColor="warning" style={styles.grow}>
              {missed.length === 1
                ? `${missed[0]} wasn’t picked up. Their booking will be marked as not picked up.`
                : `${missed.join(', ')} weren’t picked up. Their bookings will be marked as not picked up.`}
            </ThemedText>
          </View>
        )}

        {error && (
          <ThemedText type="small" themeColor="error">
            {error}
          </ThemedText>
        )}

        <View style={styles.buttons}>
          <Button label="Finish trip" loading={finishing} onPress={onFinish} />
          <Button label="Not yet" variant="text" disabled={finishing} onPress={onCancel} />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(10,20,14,0.48)',
  },
  sheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.three,
    paddingBottom: Spacing.five,
    gap: Spacing.three,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
  },
  title: {
    fontSize: 22,
    lineHeight: 28,
    fontWeight: 800,
  },
  warning: {
    flexDirection: 'row',
    gap: Spacing.two,
    borderRadius: Spacing.three,
    padding: Spacing.three,
  },
  grow: {
    flex: 1,
  },
  buttons: {
    gap: Spacing.two,
  },
});
