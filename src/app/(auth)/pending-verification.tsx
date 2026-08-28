import { Link, useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { OnboardingFooter } from '@/components/ui/onboarding-footer';
import { OnboardingHeader } from '@/components/ui/onboarding-header';
import { Screen } from '@/components/ui/screen';
import { StatusIcon } from '@/components/ui/status-icon';
import { StatusPill } from '@/components/ui/status-pill';
import { Spacing } from '@/constants/theme';
import { VerificationStatus } from '@/constants/verification-status.enum';
import { useTheme } from '@/hooks/use-theme';
import { useAuthStore } from '@/stores/useAuthStore';

type ReviewState = 'pending' | 'verified' | 'rejected';

function getReviewState(
  identityStatus?: VerificationStatus,
  workplaceStatus?: VerificationStatus,
): ReviewState {
  if (identityStatus === VerificationStatus.REJECTED || workplaceStatus === VerificationStatus.REJECTED) {
    return 'rejected';
  }
  if (identityStatus === VerificationStatus.VERIFIED && workplaceStatus === VerificationStatus.VERIFIED) {
    return 'verified';
  }
  return 'pending';
}

export default function PendingVerificationScreen() {
  const theme = useTheme();
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const refreshMe = useAuthStore((state) => state.refreshMe);

  const [isChecking, setIsChecking] = useState(false);

  async function handleCheckStatus() {
    setIsChecking(true);
    try {
      // If the status changed, the root auth gate navigates onward automatically.
      await refreshMe();
    } finally {
      setIsChecking(false);
    }
  }

  if (!user) {
    return (
      <Screen header={<OnboardingHeader />}>
        <ActivityIndicator style={styles.loading} color={theme.primary} />
      </Screen>
    );
  }

  const reviewState = getReviewState(user.verification.identityStatus, user.verification.workplaceStatus);

  return (
    <Screen header={<OnboardingHeader />}>
      <StatusPill label="STEP 2 OF 2" />

      {reviewState === 'pending' && (
        <View style={styles.centeredGroup}>
          <StatusIcon variant="neutral" icon="clock" />
          <ThemedText type="title" style={styles.centeredTitle}>
            Verification in progress
          </ThemedText>
          <ThemedText themeColor="textSecondary" style={styles.centeredText}>
            We&apos;re reviewing your NIC and LinkedIn profile. This usually takes 1–2 business days.
          </ThemedText>

          <View style={[styles.summaryCard, { backgroundColor: theme.backgroundElement }]}>
            <View style={styles.summaryRow}>
              <ThemedText themeColor="textSecondary">LinkedIn</ThemedText>
              <ThemedText type="smallBold" numberOfLines={1} style={styles.summaryValue}>
                {user.linkedinUrl}
              </ThemedText>
            </View>
            <Link href="/verify" style={styles.editLink}>
              <ThemedText type="linkPrimary" themeColor="primary" style={styles.editLinkText}>
                Edit submission
              </ThemedText>
            </Link>
          </View>

          <Button label="Check status" variant="soft" onPress={handleCheckStatus} loading={isChecking} />
          <ThemedText type="small" themeColor="textSecondary" style={styles.centeredText}>
            We&apos;ll notify you the moment you&apos;re verified.
          </ThemedText>
        </View>
      )}

      {reviewState === 'verified' && (
        <View style={styles.centeredGroup}>
          <StatusIcon variant="success" icon="checkCircle" />
          <ThemedText type="title" style={styles.centeredTitle}>
            You&apos;re verified
          </ThemedText>
          <ThemedText themeColor="textSecondary" style={styles.centeredText}>
            You can now see today&apos;s shared rides.
          </ThemedText>
          <Button label="Continue" trailingArrow onPress={() => router.replace('/')} />
        </View>
      )}

      {reviewState === 'rejected' && (
        <View style={styles.centeredGroup}>
          <StatusIcon variant="error" icon="errorCircle" />
          <ThemedText type="title" style={styles.centeredTitle}>
            We couldn&apos;t verify your NIC
          </ThemedText>
          <ThemedText themeColor="textSecondary" style={styles.centeredText}>
            {user.verification.rejectionReason ?? 'Please check your documents and try again.'}
          </ThemedText>
          <Button label="Resubmit documents" onPress={() => router.push('/verify')} />
          <ThemedText themeColor="textSecondary">Contact support</ThemedText>
        </View>
      )}

      <OnboardingFooter />
    </Screen>
  );
}

const styles = StyleSheet.create({
  loading: {
    marginTop: Spacing.six,
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
  summaryCard: {
    width: '100%',
    borderRadius: Spacing.three,
    padding: Spacing.three,
    gap: Spacing.two,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: Spacing.two,
  },
  summaryValue: {
    flexShrink: 1,
    textAlign: 'right',
  },
  editLink: {
    alignSelf: 'flex-end',
  },
  editLinkText: {
    fontWeight: '700',
  },
});
