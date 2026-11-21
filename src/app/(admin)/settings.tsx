import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { changePassword } from '@/api/auth.api';
import { ThemedText } from '@/components/themed-text';
import { Banner } from '@/components/ui/banner';
import { Button } from '@/components/ui/button';
import { TextField } from '@/components/ui/text-field';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useAuthStore } from '@/stores/useAuthStore';
import { getErrorMessage } from '@/utils/errors';

const MIN_PASSWORD_LENGTH = 8;

export default function AdminSettingsScreen() {
  const theme = useTheme();
  const setSession = useAuthStore((state) => state.setSession);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mismatch, setMismatch] = useState(false);
  const [saved, setSaved] = useState(false);

  const canSubmit = currentPassword.length > 0 && newPassword.length >= MIN_PASSWORD_LENGTH && !isSubmitting;

  async function handleSubmit() {
    setError(null);
    setSaved(false);
    setMismatch(false);

    if (newPassword !== confirmPassword) {
      setError('Passwords don’t match.');
      setMismatch(true);
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await changePassword(currentPassword, newPassword);
      // the old refresh token no longer works, so store the new ones
      await setSession(result);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setSaved(true);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <ThemedText type="smallBold" style={styles.pageTitle}>
        Settings
      </ThemedText>

      <View style={[styles.card, { backgroundColor: theme.background, borderColor: theme.border }]}>
        <ThemedText type="smallBold">Change password</ThemedText>

        {error && <Banner message={error} />}
        {saved && (
          <Banner
            tone="success"
            icon="shieldCheck"
            message="Password changed. Other devices have been signed out."
          />
        )}

        <TextField
          label="Current password"
          value={currentPassword}
          onChangeText={setCurrentPassword}
          isPassword
          textContentType="password"
        />
        <TextField
          label="New password"
          value={newPassword}
          onChangeText={setNewPassword}
          isPassword
          textContentType="newPassword"
          helperText={`At least ${MIN_PASSWORD_LENGTH} characters, with upper and lower case letters and a number`}
        />
        <TextField
          label="Confirm new password"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          isPassword
          textContentType="newPassword"
          error={mismatch ? 'Passwords don’t match.' : undefined}
        />

        <Button label="Update password" onPress={handleSubmit} disabled={!canSubmit} loading={isSubmitting} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: Spacing.four,
    gap: Spacing.four,
    maxWidth: 560,
  },
  pageTitle: {
    fontSize: 18,
  },
  card: {
    borderWidth: 1,
    borderRadius: Spacing.three,
    padding: Spacing.four,
    gap: Spacing.three,
  },
});
