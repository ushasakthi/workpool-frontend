import { Link } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { useState } from 'react';
import { StyleSheet, Text, useWindowDimensions, View } from 'react-native';

import { login } from '@/api/auth.api';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Banner } from '@/components/ui/banner';
import { Button } from '@/components/ui/button';
import { TextField } from '@/components/ui/text-field';
import { Icons } from '@/constants/icons';
import { AdminMaxContentWidth, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useAuthStore } from '@/stores/useAuthStore';
import { getErrorMessage } from '@/utils/errors';

// Below this width the marketing pane is dropped in favor of a plain centered form —
// this screen is a desktop/web surface (see AdminMaxContentWidth), not a phone layout.
const MARKETING_PANE_BREAKPOINT = 860;

export default function AdminLoginScreen() {
  const theme = useTheme();
  const { width } = useWindowDimensions();
  const showMarketingPane = width >= MARKETING_PANE_BREAKPOINT;

  const setSession = useAuthStore((state) => state.setSession);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSubmit = email.trim().length > 0 && password.length > 0 && !isSubmitting;

  async function handleLogin() {
    setError(null);
    setIsSubmitting(true);
    try {
      const result = await login({ email: email.trim(), password });
      // Navigation is handled by the root auth gate once the store updates.
      await setSession(result);
    } catch (err) {
      setError(getErrorMessage(err));
      setIsSubmitting(false);
    }
  }

  return (
    <ThemedView type="backgroundElement" style={styles.page}>
      <View style={[styles.card, { maxWidth: AdminMaxContentWidth }, !showMarketingPane && styles.cardNarrow]}>
        <ThemedView style={[styles.formPane, !showMarketingPane && styles.formPaneNarrow]}>
          <View style={styles.formInner}>
            <View style={[styles.logoBadge, { backgroundColor: theme.primary }]}>
              <ThemedText type="subtitle" themeColor="onPrimary" style={styles.logoText}>
                WP
              </ThemedText>
            </View>

            <View style={styles.headingGroup}>
              <ThemedText type="title" style={styles.title}>
                Admin console
              </ThemedText>
              <ThemedText themeColor="textSecondary">Sign in with your verified work email.</ThemedText>
            </View>

            {error && <Banner message={error} />}

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

            <Button label="Log in" onPress={handleLogin} disabled={!canSubmit} loading={isSubmitting} />

            <View style={styles.divider} />

            <View style={styles.footerRow}>
              <ThemedText themeColor="textSecondary">Not an admin? </ThemedText>
              <Link href="/login">
                <ThemedText themeColor="primary" style={styles.footerLinkText}>
                  Go to the WorkPool app
                </ThemedText>
              </Link>
            </View>
          </View>
        </ThemedView>

        {showMarketingPane && (
          <View style={styles.marketingPane}>
            <View style={styles.trustPill}>
              <SymbolView name={Icons.shieldCheck} size={14} tintColor="#FFFFFF" />
              <Text style={styles.trustPillText}>Trusted by 40+ company fleets</Text>
            </View>

            <View style={styles.marketingCopy}>
              <Text style={styles.marketingHeadline}>Every ride, verified.</Text>
              <Text style={styles.marketingSubtext}>
                Review driver documents, monitor routes, and keep shared commutes safe — all from
                one console.
              </Text>
            </View>

            <View style={styles.statsRow}>
              <View>
                <Text style={styles.statValue}>18.2k</Text>
                <Text style={styles.statLabel}>Rides pooled</Text>
              </View>
              <View>
                <Text style={styles.statValue}>96%</Text>
                <Text style={styles.statLabel}>On-time match</Text>
              </View>
            </View>
          </View>
        )}
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.four,
  },
  card: {
    flexDirection: 'row',
    width: '100%',
    borderRadius: Spacing.four,
    overflow: 'hidden',
  },
  cardNarrow: {
    maxWidth: 480,
  },
  formPane: {
    flex: 1,
    padding: Spacing.six,
    justifyContent: 'center',
  },
  formPaneNarrow: {
    padding: Spacing.five,
  },
  formInner: {
    gap: Spacing.four,
    maxWidth: 400,
    alignSelf: 'center',
    width: '100%',
  },
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
    backgroundColor: 'rgba(128,128,128,0.25)',
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  footerLinkText: {
    fontWeight: '700',
  },
  marketingPane: {
    flex: 1,
    padding: Spacing.six,
    justifyContent: 'space-between',
    // Flat brand green rather than a gradient — this RN Web version doesn't render
    // experimental_backgroundImage, and a fixed marketing panel doesn't need to be theme-aware.
    backgroundColor: '#1C3327',
  },
  trustPill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: Spacing.one,
    backgroundColor: 'rgba(255,255,255,0.14)',
    borderRadius: Spacing.five,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.one,
  },
  trustPillText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  marketingCopy: {
    gap: Spacing.three,
  },
  marketingHeadline: {
    color: '#FFFFFF',
    fontSize: 40,
    fontWeight: '700',
    lineHeight: 46,
  },
  marketingSubtext: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 16,
    lineHeight: 24,
    maxWidth: 380,
  },
  statsRow: {
    flexDirection: 'row',
    gap: Spacing.six,
  },
  statValue: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '700',
  },
  statLabel: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 14,
    marginTop: Spacing.half,
  },
});
