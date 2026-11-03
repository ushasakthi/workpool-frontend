import { SymbolView } from 'expo-symbols';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Icons } from '@/constants/icons';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { formatClockTime } from '@/utils/formatters';

export const PIN_LENGTH = 4;

// four digit boxes; `active` outlines the box the next digit goes into
export function PinBoxes({ digits, active }: { digits: string; active?: number }) {
  const theme = useTheme();
  return (
    <View style={styles.boxes}>
      {Array.from({ length: PIN_LENGTH }).map((_, index) => {
        const digit = digits[index];
        return (
          <View
            key={index}
            style={[
              styles.box,
              { backgroundColor: digit ? theme.background : theme.backgroundElement, borderColor: theme.border },
              index === active && { backgroundColor: theme.background, borderColor: theme.primary, borderWidth: 2 },
            ]}>
            <ThemedText style={styles.digit}>{digit ?? ''}</ThemedText>
          </View>
        );
      })}
    </View>
  );
}

// passenger: the PIN to show the driver when getting in
export function PickupPin({ pin }: { pin: string }) {
  const theme = useTheme();
  return (
    <View style={[styles.pinBlock, { backgroundColor: theme.backgroundElement }]}>
      <ThemedText type="small" themeColor="textSecondary">
        Pickup PIN
      </ThemedText>
      <PinBoxes digits={pin} />
      <ThemedText type="small" themeColor="textSecondary" style={styles.center}>
        Show this to your driver when you get in
      </ThemedText>
    </View>
  );
}

// both sides, once the driver has checked the PIN
export function PickedUpRow({ at }: { at: string }) {
  const theme = useTheme();
  return (
    <View style={[styles.pickedUp, { backgroundColor: theme.primarySoft }]}>
      <SymbolView name={Icons.checkCircle} size={18} tintColor={theme.primary} />
      <ThemedText type="smallBold" style={styles.grow}>
        Picked up
      </ThemedText>
      <ThemedText type="small" themeColor="textSecondary">
        {formatClockTime(at)}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  boxes: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: Spacing.two,
  },
  box: {
    width: 60,
    height: 68,
    borderWidth: 1,
    borderRadius: Spacing.three,
    alignItems: 'center',
    justifyContent: 'center',
  },
  digit: {
    fontSize: 36,
    lineHeight: 44,
    fontWeight: 800,
  },
  pinBlock: {
    alignItems: 'center',
    gap: Spacing.two,
    borderRadius: Spacing.three,
    padding: Spacing.three,
  },
  center: {
    textAlign: 'center',
  },
  pickedUp: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    borderRadius: Spacing.three,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
  },
  grow: {
    flex: 1,
  },
});
