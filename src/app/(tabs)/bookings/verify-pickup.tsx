import { useLocalSearchParams, useRouter } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { PIN_LENGTH, PinBoxes } from '@/components/bookings/pickup-status';
import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { Screen } from '@/components/ui/screen';
import { StatusIcon } from '@/components/ui/status-icon';
import { Icons } from '@/constants/icons';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useBookingStore } from '@/stores/useBookingStore';
import { errorStatus, getErrorMessage } from '@/utils/errors';
import { formatClockTime } from '@/utils/formatters';

// an on-screen keypad, so it looks and works the same on phones and web
const KEY_ROWS = [
  ['1', '2', '3'],
  ['4', '5', '6'],
  ['7', '8', '9'],
  ['', '0', 'delete'],
];

export default function VerifyPickupScreen() {
  const router = useRouter();
  const { bookingId } = useLocalSearchParams<{ bookingId: string }>();
  const request = useBookingStore((state) => state.requests?.find((b) => b.id === bookingId));
  const verifyPickup = useBookingStore((state) => state.verifyPickup);

  const [pin, setPin] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const header = <SheetHeader onClose={() => router.back()} />;

  if (!request) {
    return (
      <Screen header={header} underTabBar>
        <ThemedText>Couldn&apos;t find this ride</ThemedText>
        <Button label="Go back" variant="soft" onPress={() => router.back()} />
      </Screen>
    );
  }

  // the store sets this once the server accepts the PIN
  if (request.pickupVerifiedAt) {
    return (
      <Screen header={header} underTabBar>
        <View style={styles.success}>
          <StatusIcon variant="success" icon="check" size={72} />
          <ThemedText style={styles.successTitle}>Pickup verified</ThemedText>
          <ThemedText themeColor="textSecondary">
            {request.otherParty.name.split(' ')[0]} · {formatClockTime(request.pickupVerifiedAt)}
          </ThemedText>
        </View>
      </Screen>
    );
  }

  function press(key: string) {
    setError(null);
    if (key === 'delete') {
      setPin((current) => current.slice(0, -1));
    } else if (pin.length < PIN_LENGTH) {
      setPin(pin + key);
    }
  }

  async function verify() {
    setVerifying(true);
    try {
      await verifyPickup(bookingId, pin);
    } catch (err) {
      // 400 = the PIN didn't match; anything else gets the usual message
      setError(errorStatus(err) === 400 ? 'Wrong PIN. Try again.' : getErrorMessage(err));
      setPin('');
    } finally {
      setVerifying(false);
    }
  }

  return (
    <Screen header={header} underTabBar>
      <View style={styles.entry}>
        <PinBoxes digits={pin} active={pin.length < PIN_LENGTH ? pin.length : undefined} />
        {error && (
          <ThemedText type="small" themeColor="error" style={styles.center}>
            {error}
          </ThemedText>
        )}
      </View>

      <Keypad disabled={verifying} onPress={press} />

      <Button
        label={verifying ? 'Verifying…' : 'Verify'}
        loading={verifying}
        disabled={pin.length < PIN_LENGTH}
        onPress={() => void verify()}
      />
    </Screen>
  );
}

function Keypad({ disabled, onPress }: { disabled: boolean; onPress: (key: string) => void }) {
  const theme = useTheme();
  return (
    <View style={styles.keypad}>
      {KEY_ROWS.map((row) => (
        <View key={row.join()} style={styles.keyRow}>
          {row.map((key) =>
            key === '' ? (
              <View key="blank" style={styles.key} />
            ) : (
              <Pressable
                key={key}
                accessibilityRole="button"
                accessibilityLabel={key === 'delete' ? 'Delete' : key}
                disabled={disabled}
                onPress={() => onPress(key)}
                style={[styles.key, { backgroundColor: theme.backgroundElement }]}>
                {key === 'delete' ? (
                  <SymbolView name={Icons.backspace} size={22} tintColor={theme.text} />
                ) : (
                  <ThemedText style={styles.keyLabel}>{key}</ThemedText>
                )}
              </Pressable>
            ),
          )}
        </View>
      ))}
    </View>
  );
}

function SheetHeader({ onClose }: { onClose: () => void }) {
  const theme = useTheme();
  return (
    <View style={styles.header}>
      <ThemedText style={styles.headerTitle}>Enter pickup PIN</ThemedText>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Close"
        onPress={onClose}
        hitSlop={8}
        style={[styles.close, { backgroundColor: theme.backgroundElement }]}>
        <SymbolView name={Icons.close} size={16} tintColor={theme.textSecondary} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: {
    fontSize: 24,
    lineHeight: 30,
    fontWeight: 700,
  },
  close: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  entry: {
    gap: Spacing.two,
    paddingVertical: Spacing.two,
  },
  center: {
    textAlign: 'center',
  },
  keypad: {
    gap: Spacing.two,
  },
  keyRow: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  key: {
    flex: 1,
    height: 56,
    borderRadius: Spacing.three,
    alignItems: 'center',
    justifyContent: 'center',
  },
  keyLabel: {
    fontSize: 24,
    lineHeight: 30,
  },
  success: {
    alignItems: 'center',
    gap: Spacing.two,
    paddingVertical: Spacing.five,
  },
  successTitle: {
    fontSize: 22,
    lineHeight: 28,
    fontWeight: 700,
  },
});
