import { Link } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';

import { register } from '@/api/auth.api';
import { RoleChoice } from '@/components/auth/role-choice';
import { TermsStep } from '@/components/auth/terms-step';
import { ThemedText } from '@/components/themed-text';
import { Banner } from '@/components/ui/banner';
import { Button } from '@/components/ui/button';
import { Screen } from '@/components/ui/screen';
import { TextField } from '@/components/ui/text-field';
import { Spacing } from '@/constants/theme';
import { UserRole } from '@/constants/user-role.enum';
import { useTheme } from '@/hooks/use-theme';
import { useAuthStore } from '@/stores/useAuthStore';
import { getErrorMessage } from '@/utils/errors';

const MIN_PASSWORD_LENGTH = 8;
const MIN_PHONE_DIGITS = 7;

export default function RegisterScreen() {
  const theme = useTheme();
  const setSession = useAuthStore((state) => state.setSession);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneLocal, setPhoneLocal] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>(UserRole.PASSENGER);
  // two steps on one screen, so the typed password never leaves this component
  const [step, setStep] = useState<'details' | 'terms'>('details');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const phoneDigits = phoneLocal.replace(/\D/g, '');
  const canContinue =
    name.trim().length > 0 &&
    email.trim().length > 0 &&
    phoneDigits.length >= MIN_PHONE_DIGITS &&
    password.length >= MIN_PASSWORD_LENGTH;

  function handleContinue() {
    setError(null);
    if (phoneDigits.length < MIN_PHONE_DIGITS) {
      setError('Enter a valid phone number.');
      return;
    }
    setStep('terms');
  }

  async function handleRegister() {
    setError(null);
    setIsSubmitting(true);
    try {
      const result = await register({
        name: name.trim(),
        email: email.trim(),
        phone: `+94${phoneDigits}`,
        password,
        role,
        acceptedTerms: true,
      });
      // the auth gate handles the redirect
      await setSession(result);
    } catch (err) {
      setError(getErrorMessage(err));
      setIsSubmitting(false);
    }
  }

  if (step === 'terms') {
    return (
      <Screen>
        <TermsStep
          submitting={isSubmitting}
          error={error}
          onBack={() => {
            setError(null);
            setStep('details');
          }}
          onAccept={() => void handleRegister()}
        />
      </Screen>
    );
  }

  return (
    <Screen>
      <View style={styles.headingGroup}>
        <ThemedText type="title" style={styles.title}>
          Create your account
        </ThemedText>
        <ThemedText themeColor="textSecondary">Takes about a minute.</ThemedText>
      </View>

      {error && <Banner message={error} />}

      <TextField label="Full name" placeholder="Amaya Fernando" value={name} onChangeText={setName} />

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

      <View style={styles.fieldGroup}>
        <ThemedText type="smallBold">Phone number</ThemedText>
        <View style={styles.phoneRow}>
          <View style={[styles.phonePrefix, { backgroundColor: theme.backgroundElement }]}>
            <ThemedText>+94</ThemedText>
          </View>
          <View style={[styles.phoneInputWrap, { backgroundColor: theme.backgroundElement }]}>
            <TextInput
              placeholder="77 123 4567"
              placeholderTextColor={theme.placeholder}
              value={phoneLocal}
              onChangeText={setPhoneLocal}
              keyboardType="phone-pad"
              textContentType="telephoneNumber"
              style={[styles.phoneInput, { color: theme.text }]}
            />
          </View>
        </View>
      </View>

      <TextField
        label="Password"
        placeholder="Create a password"
        value={password}
        onChangeText={setPassword}
        isPassword
        textContentType="newPassword"
        helperText={`Minimum ${MIN_PASSWORD_LENGTH} characters`}
      />

      <View style={styles.fieldGroup}>
        <ThemedText type="smallBold">I want to</ThemedText>
        <RoleChoice value={role} onChange={setRole} />
        <ThemedText type="small" themeColor="textSecondary">
          You can change this later in your profile.
        </ThemedText>
      </View>

      <Button label="Continue" trailingArrow onPress={handleContinue} disabled={!canContinue} />

      <View style={styles.footerRow}>
        <ThemedText themeColor="textSecondary">Already have an account? </ThemedText>
        <Link href="/login">
          <ThemedText themeColor="primary" style={styles.footerLinkText}>
            Log in
          </ThemedText>
        </Link>
      </View>
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
  fieldGroup: {
    gap: Spacing.two,
  },
  phoneRow: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  phonePrefix: {
    borderRadius: Spacing.three,
    paddingHorizontal: Spacing.three,
    alignItems: 'center',
    justifyContent: 'center',
  },
  phoneInputWrap: {
    flex: 1,
    borderRadius: Spacing.three,
    paddingHorizontal: Spacing.three,
  },
  phoneInput: {
    fontSize: 16,
    paddingVertical: Spacing.three,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  footerLinkText: {
    fontWeight: '700',
  },
});
