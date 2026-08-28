import { Link, useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { resetPassword } from '@/api/auth.api';
import { ThemedText } from '@/components/themed-text';
import { Banner } from '@/components/ui/banner';
import { Button } from '@/components/ui/button';
import { Screen } from '@/components/ui/screen';
import { StatusPill } from '@/components/ui/status-pill';
import { TextField } from '@/components/ui/text-field';
import { Spacing } from '@/constants/theme';
import { getErrorMessage } from '@/utils/errors';

const MIN_PASSWORD_LENGTH = 8;

export default function ResetPasswordScreen() {
  const router = useRouter();
  const { token } = useLocalSearchParams<{ token?: string }>();

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!token) {
    return (
      <Screen>
        <Banner message="This reset link is invalid or has expired. Request a new one." />
        <Link href="/forgot-password">
          <ThemedText type="linkPrimary" themeColor="primary" style={styles.backLinkText}>
            Request a new link
          </ThemedText>
        </Link>
      </Screen>
    );
  }

  const canSubmit = newPassword.length >= MIN_PASSWORD_LENGTH && !isSubmitting;

  async function handleSubmit() {
    setError(null);

    if (newPassword !== confirmPassword) {
      setError('Passwords don’t match.');
      return;
    }

    setIsSubmitting(true);
    try {
      await resetPassword(token!, newPassword);
      setIsSuccess(true);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Screen>
      <StatusPill label="Secure link verified" showCheck />

      <View style={styles.headingGroup}>
        <ThemedText type="title" style={styles.title}>
          Set a new password
        </ThemedText>
        <ThemedText themeColor="textSecondary">Choose a strong password for your account.</ThemedText>
      </View>

      {error && <Banner message={error} />}
      {isSuccess && <Banner message="Password updated. You can now log in." tone="success" />}

      <TextField
        label="New password"
        placeholder="Create new password"
        value={newPassword}
        onChangeText={setNewPassword}
        isPassword
        textContentType="newPassword"
        editable={!isSuccess}
        helperText={`Minimum ${MIN_PASSWORD_LENGTH} characters`}
      />

      <TextField
        label="Confirm password"
        placeholder="Re-enter new password"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        isPassword
        textContentType="newPassword"
        editable={!isSuccess}
      />

      {isSuccess ? (
        <Button label="Go to login" trailingArrow onPress={() => router.replace('/login')} />
      ) : (
        <Button label="Update password" onPress={handleSubmit} disabled={!canSubmit} loading={isSubmitting} />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  headingGroup: {
    gap: Spacing.one,
  },
  title: {
    fontSize: 28,
    lineHeight: 34,
  },
  backLinkText: {
    fontWeight: '700',
  },
});
