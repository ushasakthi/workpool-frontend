import { useRouter } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Banner } from '@/components/ui/banner';
import { Button } from '@/components/ui/button';
import { Screen } from '@/components/ui/screen';
import { TextField } from '@/components/ui/text-field';
import { Icons } from '@/constants/icons';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useAuthStore } from '@/stores/useAuthStore';
import { getErrorMessage } from '@/utils/errors';

const COUNTRY_CODE = '+94';
// a Sri Lankan mobile number without the leading 0, e.g. 77 123 4567
const LOCAL_DIGITS = 9;

// "+94771234567" -> "771234567" for the input
function localPart(phone?: string): string {
  return phone?.startsWith(COUNTRY_CODE) ? phone.slice(COUNTRY_CODE.length) : (phone ?? '');
}

export default function EmergencyContactScreen() {
  const router = useRouter();
  const saved = useAuthStore((state) => state.user?.emergencyContact);
  const updateEmergencyContact = useAuthStore((state) => state.updateEmergencyContact);

  const [name, setName] = useState(saved?.name ?? '');
  const [number, setNumber] = useState(localPart(saved?.phone));
  // errors only show after the first Save, not while typing
  const [showErrors, setShowErrors] = useState(false);
  const [saving, setSaving] = useState(false);
  const [justSaved, setJustSaved] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // people often type the local 0 (0771234567), which isn't part of +94
  const digits = number.replace(/\D/g, '').replace(/^0/, '');
  const trimmedName = name.trim();
  const phone = `${COUNTRY_CODE}${digits}`;
  const isEmpty = !trimmedName && !digits;
  const isUnchanged = trimmedName === (saved?.name ?? '') && phone === saved?.phone;

  function edit(update: () => void) {
    update();
    setJustSaved(false);
    setSaveError(null);
  }

  async function save() {
    setShowErrors(true);
    if (!trimmedName || digits.length !== LOCAL_DIGITS) return;

    setSaving(true);
    try {
      await updateEmergencyContact({ name: trimmedName, phone });
      setJustSaved(true);
    } catch (err) {
      setSaveError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  return (
    <Screen header={<BackHeader onBack={() => router.back()} />} underTabBar>
      <ThemedText themeColor="textSecondary">
        We&apos;ll prepare a message to them if you press SOS during a ride.
      </ThemedText>

      <TextField
        label="Name"
        value={name}
        onChangeText={(text) => edit(() => setName(text))}
        placeholder="e.g. Amali Perera"
        autoCapitalize="words"
        maxLength={100}
        editable={!saving}
        error={showErrors && !trimmedName ? 'Enter their name' : undefined}
      />

      <TextField
        label="Mobile number"
        prefix={COUNTRY_CODE}
        value={number}
        onChangeText={(text) => edit(() => setNumber(text))}
        placeholder="77 123 4567"
        keyboardType="phone-pad"
        maxLength={12}
        editable={!saving}
        error={
          showErrors && digits.length !== LOCAL_DIGITS ? 'Enter a 9-digit mobile number' : undefined
        }
      />

      {justSaved && <SavedRow />}
      {saveError && <Banner message={saveError} />}

      <View style={styles.spacer} />

      <Button
        label={saving ? 'Saving…' : 'Save'}
        loading={saving}
        disabled={isEmpty || isUnchanged}
        onPress={() => void save()}
      />
    </Screen>
  );
}

function SavedRow() {
  const theme = useTheme();
  return (
    <View style={[styles.saved, { backgroundColor: theme.primarySoft }]}>
      <SymbolView name={Icons.checkCircle} size={18} tintColor={theme.primary} />
      <ThemedText type="smallBold">Saved</ThemedText>
    </View>
  );
}

function BackHeader({ onBack }: { onBack: () => void }) {
  const theme = useTheme();
  return (
    <View style={styles.header}>
      <Pressable accessibilityRole="button" accessibilityLabel="Back" onPress={onBack} hitSlop={8}>
        <SymbolView name={Icons.back} size={20} tintColor={theme.text} />
      </Pressable>
      <ThemedText style={styles.headerTitle}>Emergency contact</ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
  },
  headerTitle: {
    fontSize: 24,
    lineHeight: 30,
    fontWeight: 700,
  },
  saved: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    borderRadius: Spacing.three,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
  },
  spacer: {
    flex: 1,
  },
});
