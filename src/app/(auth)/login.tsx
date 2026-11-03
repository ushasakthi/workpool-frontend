import { Link, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { login } from '@/api/auth.api';
import { ThemedText } from '@/components/themed-text';
import { Banner } from '@/components/ui/banner';
import { Button } from '@/components/ui/button';
import { Screen } from '@/components/ui/screen';
import { TextField } from '@/components/ui/text-field';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useAuthStore } from '@/stores/useAuthStore';
import { getErrorMessage } from '@/utils/errors';

export default function LoginScreen() {
  const theme = useTheme();
  const setSession = useAuthStore((state) => state.setSession);
  const { justSubmitted, email: prefillEmail } = useLocalSearchParams<{
    justSubmitted?: string;
    email?: string;
  }>();

  const [email, setEmail] = useState(prefillEmail ?? '');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSubmit = email.trim().length > 0 && password.length > 0 && !isSubmitting;

  async function handleLogin() {
    setError(null);
    setIsSubmitting(true);
    try {
      const result = await login({ email: email.trim(), password });
      // the auth gate handles the redirect
      await setSession(result);
    } catch (err) {
      setError(getErrorMessage(err));
      setIsSubmitting(false);
    }
  }

  return (
    <Screen>
      <View style={[styles.logoBadge, { backgroundColor: theme.primary }]}>
        <ThemedText type="subtitle" themeColor="onPrimary" style={styles.logoText}>
          WP
        </ThemedText>
      </View>

      <View style={styles.headingGroup}>
        <ThemedText type="title" style={styles.title}>
          Welcome back
        </ThemedText>
        <ThemedText themeColor="textSecondary">Sign in to see today&apos;s shared rides.</ThemedText>
      </View>

      {error && <Banner message={error} />}
      {!error && justSubmitted && (
        <Banner
          tone="success"
          message="Account created and verification submitted. Log in to check your status."
        />
      )}

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

      <TextField
        label="Password"
        labelRight={
          <Link href="/forgot-password">
            <ThemedText type="linkPrimary" themeColor="primary">
              Forgot password?
            </ThemedText>
          </Link>
        }
        placeholder="Enter password"
        value={password}
        onChangeText={setPassword}
        isPassword
        textContentType="password"
      />

      <Button label="Log in" trailingArrow onPress={handleLogin} disabled={!canSubmit} loading={isSubmitting} />

      <View style={[styles.divider, { backgroundColor: theme.border }]} />

      <View style={styles.footerRow}>
        <ThemedText themeColor="textSecondary">New to WorkPool? </ThemedText>
        <Link href="/register">
          <ThemedText themeColor="primary" style={styles.footerLinkText}>
            Create account
          </ThemedText>
        </Link>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  logoBadge: {
    width: 56,
    height: 56,
    borderRadius: Spacing.three,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    fontSize: 18,
  },
  headingGroup: {
    gap: Spacing.one,
  },
  title: {
    fontSize: 32,
    lineHeight: 38,
  },
  divider: {
    height: 1,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  footerLinkText: {
    fontWeight: '700',
  },
});
