import { isAxiosError } from 'axios';
import { Link, useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { resetPassword } from '@/api/auth.api';
import { ThemedText } from '@/components/themed-text';
import { Banner } from '@/components/ui/banner';
import { Button } from '@/components/ui/button';
import { Screen } from '@/components/ui/screen';
import { StatusIcon } from '@/components/ui/status-icon';
import { StatusPill } from '@/components/ui/status-pill';
import { TextField } from '@/components/ui/text-field';
import { Spacing } from '@/constants/theme';
import { getErrorMessage } from '@/utils/errors';
import { maskEmail } from '@/utils/formatters';

const MIN_PASSWORD_LENGTH = 8;

export default function ResetPasswordScreen() {
  const router = useRouter();
  const { token } = useLocalSearchParams<{ token?: string }>();

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mismatch, setMismatch] = useState(false);
  const [isTokenInvalid, setIsTokenInvalid] = useState(false);
  const [successEmail, setSuccessEmail] = useState<string | null>(null);

  if (!token || isTokenInvalid) {
    return (
      <Screen>
        <View style={styles.centeredGroup}>
          <StatusIcon variant="error" icon="errorCircle" />
          <ThemedText type="title" style={styles.centeredTitle}>
            This link has expired
          </ThemedText>
          <ThemedText themeColor="textSecondary" style={styles.centeredText}>
            Reset links are only valid for a short time. Request a new one to continue.
          </ThemedText>
          <Button label="Request a new link" onPress={() => router.replace('/forgot-password')} />
          <Link href="/login" style={styles.backLink}>
            <ThemedText type="linkPrimary" themeColor="primary" style={styles.backLinkText}>
              Back to login
            </ThemedText>
          </Link>
        </View>
      </Screen>
    );
  }

  if (successEmail) {
    return (
      <Screen>
        <View style={styles.centeredGroup}>
          <StatusIcon variant="success" icon="checkCircle" />
          <ThemedText type="title" style={styles.centeredTitle}>
            Password updated
          </ThemedText>
          <ThemedText themeColor="textSecondary" style={styles.centeredText}>
            Your password has been changed successfully.
          </ThemedText>
          <StatusPill
            label={maskEmail(successEmail)}
            icon="mail"
            tone="neutral"
            style={styles.emailPill}
          />
          <Banner
            tone="success"
            icon="shieldCheck"
            message="You've been signed out of other devices for your security."
          />
          <ThemedText themeColor="textSecondary">
            Didn&apos;t do this? Contact support
          </ThemedText>
          <Button
            label="Go to login"
            trailingArrow
            onPress={() => router.replace({ pathname: '/login', params: { email: successEmail } })}
          />
        </View>
      </Screen>
    );
  }

  const canSubmit = newPassword.length >= MIN_PASSWORD_LENGTH && !isSubmitting;

  async function handleSubmit() {
    setError(null);
    setMismatch(false);

    if (newPassword !== confirmPassword) {
      setError('Passwords don’t match.');
      setMismatch(true);
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await resetPassword(token!, newPassword);
      setSuccessEmail(result.email);
    } catch (err) {
      if (isAxiosError(err) && err.response?.status === 401) {
        setIsTokenInvalid(true);
      } else {
        setError(getErrorMessage(err));
      }
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

      <TextField
        label="New password"
        placeholder="Create new password"
        value={newPassword}
        onChangeText={setNewPassword}
        isPassword
        textContentType="newPassword"
        helperText={`Minimum ${MIN_PASSWORD_LENGTH} characters`}
      />

      <TextField
        label="Confirm password"
        placeholder="Re-enter new password"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        isPassword
        textContentType="newPassword"
        error={mismatch ? 'Passwords don’t match.' : undefined}
      />

      <Button label="Update password" onPress={handleSubmit} disabled={!canSubmit} loading={isSubmitting} />
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
  backLink: {
    alignSelf: 'center',
  },
  backLinkText: {
    fontWeight: '700',
  },
  centeredGroup: {
    alignItems: 'center',
    gap: Spacing.three,
    paddingTop: Spacing.five,
  },
  centeredTitle: {
    fontSize: 24,
    lineHeight: 30,
    textAlign: 'center',
  },
  centeredText: {
    textAlign: 'center',
  },
  emailPill: {
    alignSelf: 'center',
  },
});
