import { Link } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { forgotPassword } from '@/api/auth.api';
import { ThemedText } from '@/components/themed-text';
import { Banner } from '@/components/ui/banner';
import { Button } from '@/components/ui/button';
import { Screen } from '@/components/ui/screen';
import { TextField } from '@/components/ui/text-field';
import { Spacing } from '@/constants/theme';
import { getErrorMessage } from '@/utils/errors';

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submittedMessage, setSubmittedMessage] = useState<string | null>(null);

  const canSubmit = email.trim().length > 0 && !isSubmitting;

  async function handleSubmit() {
    setError(null);
    setSubmittedMessage(null);
    setIsSubmitting(true);
    try {
      const message = await forgotPassword(email.trim());
      setSubmittedMessage(message);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Screen>
      <View style={styles.headingGroup}>
        <ThemedText type="title" style={styles.title}>
          Reset your password
        </ThemedText>
        <ThemedText themeColor="textSecondary">We&apos;ll email you a secure link.</ThemedText>
      </View>

      {error && <Banner message={error} />}
      {submittedMessage && <Banner message={submittedMessage} tone="success" />}

      <TextField
        label="Work email"
        placeholder="you@company.com"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        autoCorrect={false}
        keyboardType="email-address"
        textContentType="emailAddress"
      />

      <Button label="Send reset link" onPress={handleSubmit} disabled={!canSubmit} loading={isSubmitting} />

      <Link href="/login" style={styles.backLink}>
        <ThemedText type="linkPrimary" themeColor="primary" style={styles.backLinkText}>
          Back to login
        </ThemedText>
      </Link>
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
});
