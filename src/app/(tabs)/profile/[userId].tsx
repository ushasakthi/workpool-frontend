import { useLocalSearchParams, useRouter } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { Avatar } from '@/components/admin/avatar';
import { ProfilePhoto } from '@/components/profile/profile-photo';
import { ThemedText } from '@/components/themed-text';
import { trustLabel } from '@/components/trust/trust-score-badge';
import { Button } from '@/components/ui/button';
import { Screen } from '@/components/ui/screen';
import { Skeleton } from '@/components/ui/skeleton';
import { StateMessage } from '@/components/ui/state-message';
import { Icons } from '@/constants/icons';
import { Spacing } from '@/constants/theme';
import { UserRole } from '@/constants/user-role.enum';
import { VerificationStatus } from '@/constants/verification-status.enum';
import { useApiImageSource } from '@/hooks/use-api-image';
import { useTheme } from '@/hooks/use-theme';
import { useReviewStore } from '@/stores/useReviewStore';
import type { Review } from '@/types/review.types';
import type { PublicUserProfile } from '@/types/user.types';
import { getErrorMessage } from '@/utils/errors';
import { formatTimeAgo } from '@/utils/formatters';

const REVIEWS_PREVIEW = 3;

const ROLE_LABEL: Record<UserRole, string> = {
  [UserRole.DRIVER]: 'Driver',
  [UserRole.PASSENGER]: 'Passenger',
  [UserRole.BOTH]: 'Driver & passenger',
  [UserRole.ADMIN]: 'WorkPool admin',
};

export default function PublicProfileScreen() {
  const router = useRouter();
  const { userId } = useLocalSearchParams<{ userId: string }>();
  const profile = useReviewStore((state) => state.profile);
  const reviews = useReviewStore((state) => state.reviews);
  const loadProfile = useReviewStore((state) => state.loadProfile);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void loadProfile(userId).catch((err) => setError(getErrorMessage(err)));
  }, [userId, loadProfile]);

  function retry() {
    setError(null);
    void loadProfile(userId).catch((err) => setError(getErrorMessage(err)));
  }

  // the store may still hold the previous person for a moment
  const current = profile?.id === userId ? profile : null;

  return (
    <Screen header={<BackHeader onBack={() => router.back()} />} underTabBar>
      {error ? (
        <StateMessage
          icon="wifiSlash"
          tone="error"
          title="Couldn't load this profile"
          message={error}
          action={{ label: 'Try again', variant: 'soft', onPress: retry }}
        />
      ) : current === null || reviews === null ? (
        <>
          <Skeleton height={96} circle style={styles.selfCenter} />
          <Skeleton height={300} radius={Spacing.four} />
          <Skeleton height={120} radius={Spacing.four} />
        </>
      ) : (
        <>
          <ProfileHeader profile={current} />
          <TrustCard profile={current} />
          <ReviewsSection profile={current} reviews={reviews} />
        </>
      )}
    </Screen>
  );
}

function ProfileHeader({ profile }: { profile: PublicUserProfile }) {
  const photo = useApiImageSource(profile.photoUrl);
  return (
    <View style={styles.hero}>
      {photo ? <ProfilePhoto photo={photo} /> : <Avatar name={profile.name} size={96} />}
      <ThemedText style={styles.name}>{profile.name}</ThemedText>
      <ThemedText type="small" themeColor="textSecondary">
        {ROLE_LABEL[profile.role]}
      </ThemedText>
    </View>
  );
}

// the score plus what it's built from, so it's never one opaque number
function TrustCard({ profile }: { profile: PublicUserProfile }) {
  const theme = useTheme();
  const { score, completedRides, ratingCount, averageRating } = profile.trustScore;

  return (
    <View style={[styles.card, { borderColor: theme.border }]}>
      <View style={styles.scoreRow}>
        <View style={[styles.bigBadge, { backgroundColor: theme.primarySoft }]}>
          <SymbolView name={Icons.shieldCheck} size={22} tintColor={theme.primary} />
          <ThemedText style={styles.bigScore} themeColor="primarySoftText">
            {score ?? 'New'}
          </ThemedText>
        </View>
        <View style={styles.grow}>
          <ThemedText type="smallBold">
            Trust Score{score === null ? '' : ` · ${trustLabel(score)}`}
          </ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            {score === null ? 'Not calculated yet' : `${score} out of 100, built from:`}
          </ThemedText>
        </View>
      </View>

      <View style={[styles.divider, { backgroundColor: theme.border }]} />

      <TrustRow
        icon="idCard"
        title="Identity verified"
        subtitle="NIC checked by WorkPool"
        value={<VerifiedValue status={profile.verification.identityStatus} />}
      />
      <TrustRow
        icon="building"
        title="Workplace verified"
        subtitle="LinkedIn checked by WorkPool"
        value={<VerifiedValue status={profile.verification.workplaceStatus} />}
      />
      <TrustRow
        icon="car"
        title="Completed rides"
        subtitle="As driver and passenger"
        value={<ThemedText type="smallBold">{completedRides}</ThemedText>}
      />
      <TrustRow
        icon="star"
        title="Average rating"
        subtitle={
          ratingCount === 0
            ? 'No ratings yet'
            : `From ${ratingCount} review${ratingCount === 1 ? '' : 's'}`
        }
        value={
          <ThemedText type="smallBold">
            {ratingCount === 0 ? '—' : `${averageRating.toFixed(1)} / 5`}
          </ThemedText>
        }
      />
    </View>
  );
}

function TrustRow({
  icon,
  title,
  subtitle,
  value,
}: {
  icon: keyof typeof Icons;
  title: string;
  subtitle: string;
  value: React.ReactNode;
}) {
  const theme = useTheme();
  return (
    <View style={styles.trustRow}>
      <View style={[styles.rowIcon, { backgroundColor: theme.backgroundElement }]}>
        <SymbolView name={Icons[icon]} size={18} tintColor={theme.text} />
      </View>
      <View style={styles.grow}>
        <ThemedText type="smallBold">{title}</ThemedText>
        <ThemedText type="small" themeColor="textSecondary">
          {subtitle}
        </ThemedText>
      </View>
      {value}
    </View>
  );
}

function VerifiedValue({ status }: { status: VerificationStatus }) {
  const theme = useTheme();
  const verified = status === VerificationStatus.VERIFIED;
  return (
    <View style={styles.verified}>
      <SymbolView
        name={verified ? Icons.checkCircle : Icons.clock}
        size={16}
        tintColor={verified ? theme.primary : theme.textSecondary}
      />
      <ThemedText type="smallBold" themeColor={verified ? 'text' : 'textSecondary'}>
        {verified ? 'Verified' : 'Not yet'}
      </ThemedText>
    </View>
  );
}

function ReviewsSection({ profile, reviews }: { profile: PublicUserProfile; reviews: Review[] }) {
  const [showAll, setShowAll] = useState(false);
  const { ratingCount, averageRating } = profile.trustScore;
  const shown = showAll ? reviews : reviews.slice(0, REVIEWS_PREVIEW);

  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <ThemedText type="smallBold" style={styles.sectionTitle}>
          Reviews
        </ThemedText>
        {ratingCount > 0 && (
          <ThemedText type="small" themeColor="textSecondary">
            {averageRating.toFixed(1)} average · {ratingCount} review{ratingCount === 1 ? '' : 's'}
          </ThemedText>
        )}
      </View>

      {reviews.length === 0 ? (
        <ThemedText themeColor="textSecondary">No reviews yet.</ThemedText>
      ) : (
        shown.map((review) => <ReviewCard key={review.id} review={review} />)
      )}

      {!showAll && reviews.length > REVIEWS_PREVIEW && (
        <Button
          label={`Show all ${reviews.length} reviews`}
          variant="soft"
          onPress={() => setShowAll(true)}
        />
      )}
    </View>
  );
}

function ReviewCard({ review }: { review: Review }) {
  const theme = useTheme();
  return (
    <View style={[styles.card, { borderColor: theme.border }]}>
      <View style={styles.reviewHeader}>
        <Avatar name={review.from.firstName} size={40} />
        <View style={styles.grow}>
          <ThemedText type="smallBold">{review.from.firstName}</ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            {review.from.role === 'passenger' ? 'Passenger' : 'Driver'} ·{' '}
            {formatTimeAgo(review.createdAt)}
          </ThemedText>
        </View>
        <View style={styles.verified}>
          <SymbolView name={Icons.starFill} size={16} tintColor={theme.accent} />
          <ThemedText type="smallBold">{review.rating}</ThemedText>
        </View>
      </View>
      {review.comment && <ThemedText>{review.comment}</ThemedText>}
    </View>
  );
}

function BackHeader({ onBack }: { onBack: () => void }) {
  const theme = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Back"
      onPress={onBack}
      hitSlop={8}
      style={styles.header}>
      <SymbolView name={Icons.back} size={20} tintColor={theme.text} />
      <ThemedText themeColor="textSecondary">Profile</ThemedText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
  },
  grow: {
    flex: 1,
  },
  center: {
    textAlign: 'center',
  },
  selfCenter: {
    alignSelf: 'center',
  },
  hero: {
    alignItems: 'center',
    gap: Spacing.one,
  },
  name: {
    fontSize: 28,
    lineHeight: 34,
    fontWeight: 700,
    marginTop: Spacing.two,
  },
  card: {
    borderWidth: 1,
    borderRadius: Spacing.four,
    padding: Spacing.three,
    gap: Spacing.three,
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
  },
  bigBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    borderRadius: Spacing.three,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
  },
  bigScore: {
    fontSize: 28,
    lineHeight: 34,
    fontWeight: 700,
  },
  divider: {
    height: 1,
  },
  trustRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
  },
  rowIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  verified: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
  },
  section: {
    gap: Spacing.three,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    fontSize: 18,
  },
  reviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
  },
});
