import { useLocalSearchParams, useRouter } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { Avatar } from '@/components/admin/avatar';
import { ThemedText } from '@/components/themed-text';
import { Banner } from '@/components/ui/banner';
import { Button } from '@/components/ui/button';
import { Screen } from '@/components/ui/screen';
import { TextField } from '@/components/ui/text-field';
import { Icons } from '@/constants/icons';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useBookingStore } from '@/stores/useBookingStore';
import { useReviewStore } from '@/stores/useReviewStore';
import type { BookingListItem } from '@/types/booking.types';
import { getErrorMessage } from '@/utils/errors';
import { formatDays } from '@/utils/schedule';

const MAX_COMMENT = 280;
const RATING_WORDS = ['', 'Poor', 'Fair', 'Okay', 'Good', 'Great'];

export default function RateReviewScreen() {
  const router = useRouter();
  const { bookingId } = useLocalSearchParams<{ bookingId: string }>();
  // the booking is already in a list: My bookings (passenger), Ride requests or Past rides (driver)
  const booking = useBookingStore(
    (state) =>
      state.myBookings?.find((b) => b.id === bookingId) ??
      state.requests?.find((b) => b.id === bookingId) ??
      state.pastDrives?.find((b) => b.id === bookingId),
  );
  const markReviewed = useBookingStore((state) => state.markReviewed);
  const submitReview = useReviewStore((state) => state.submitReview);

  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!booking) {
    return (
      <Screen underTabBar>
        <ThemedText style={styles.title}>Couldn&apos;t find this ride</ThemedText>
        <Button label="Go back" variant="soft" onPress={() => router.back()} />
      </Screen>
    );
  }

  const firstName = booking.otherParty.name.split(' ')[0];

  async function send() {
    setError(null);
    setSending(true);
    try {
      await submitReview({ bookingId, rating, comment: comment.trim() || undefined });
      markReviewed(bookingId);
      setSent(true);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSending(false);
    }
  }

  if (sent) {
    return <ThanksState rating={rating} firstName={firstName} onDone={() => router.back()} />;
  }

  return (
    <Screen header={<ReviewHeader onSkip={() => router.back()} />} underTabBar>
      <View style={styles.hero}>
        <Avatar name={booking.otherParty.name} size={72} />
        <ThemedText style={styles.title}>How was your ride with {firstName}?</ThemedText>
        <ThemedText type="small" themeColor="textSecondary" style={styles.center}>
          {routeSummary(booking)}
        </ThemedText>
      </View>

      <View style={styles.starsBlock}>
        <StarPicker value={rating} onChange={setRating} disabled={sending} />
        <ThemedText type="smallBold" themeColor={rating ? 'text' : 'textSecondary'}>
          {rating ? `${rating} of 5 · ${RATING_WORDS[rating]}` : 'Tap a star to rate'}
        </ThemedText>
      </View>

      <TextField
        label="Add a comment (optional)"
        labelRight={
          <ThemedText type="small" themeColor="textSecondary">
            {comment.length}/{MAX_COMMENT}
          </ThemedText>
        }
        value={comment}
        onChangeText={setComment}
        maxLength={MAX_COMMENT}
        multiline
        placeholder="What went well, or what could be better?"
        helperText={`Shown on ${firstName}'s profile with your first name.`}
        editable={!sending}
      />

      {error && <Banner message={error} />}

      <View style={styles.spacer} />

      <View style={styles.footer}>
        <Button
          label="Submit review"
          loading={sending}
          disabled={rating === 0}
          onPress={() => void send()}
        />
        <ThemedText type="small" themeColor="textSecondary" style={styles.center}>
          {rating === 0 ? 'Choose a rating to continue' : "Reviews can't be changed once sent"}
        </ThemedText>
      </View>
    </Screen>
  );
}

// "Mo We Fr · Near Nedimala → Near Fort, Colombo"
function routeSummary(booking: BookingListItem): string {
  const { ride } = booking;
  return `${formatDays(ride.daysOfWeek)} · ${ride.origin.label ?? 'Pickup'} → ${ride.destination.label ?? 'Drop-off'}`;
}

// filled stars up to the rating; the "4 of 5 · Good" text means it's not colour alone
function StarPicker({
  value,
  onChange,
  disabled,
}: {
  value: number;
  onChange: (rating: number) => void;
  disabled: boolean;
}) {
  const theme = useTheme();
  return (
    <View style={styles.stars}>
      {[1, 2, 3, 4, 5].map((star) => (
        <Pressable
          key={star}
          accessibilityRole="button"
          accessibilityLabel={`${star} star${star === 1 ? '' : 's'}`}
          disabled={disabled}
          onPress={() => onChange(star)}
          hitSlop={4}>
          <SymbolView
            name={star <= value ? Icons.starFill : Icons.star}
            size={40}
            tintColor={star <= value ? theme.accent : theme.border}
          />
        </Pressable>
      ))}
    </View>
  );
}

function ReviewHeader({ onSkip }: { onSkip: () => void }) {
  const theme = useTheme();
  return (
    <View style={styles.header}>
      <View style={[styles.pill, { backgroundColor: theme.backgroundElement }]}>
        <SymbolView name={Icons.flag} size={14} tintColor={theme.text} />
        <ThemedText type="smallBold">Ride completed</ThemedText>
      </View>
      <Pressable accessibilityRole="button" onPress={onSkip} hitSlop={8}>
        <ThemedText type="smallBold" themeColor="textSecondary">
          Skip
        </ThemedText>
      </Pressable>
    </View>
  );
}

function ThanksState({
  rating,
  firstName,
  onDone,
}: {
  rating: number;
  firstName: string;
  onDone: () => void;
}) {
  const theme = useTheme();
  return (
    <Screen underTabBar>
      <View style={styles.thanks}>
        <View style={[styles.thanksIcon, { backgroundColor: theme.primarySoft }]}>
          <SymbolView name={Icons.checkCircle} size={30} tintColor={theme.primary} />
        </View>
        <ThemedText style={styles.thanksTitle}>Thanks for your review</ThemedText>
        <View style={styles.ratingLine}>
          <SymbolView name={Icons.starFill} size={16} tintColor={theme.accent} />
          <ThemedText type="smallBold">
            {rating} of 5 · {RATING_WORDS[rating]}
          </ThemedText>
        </View>
        <ThemedText themeColor="textSecondary" style={styles.center}>
          Your rating counts toward {firstName}&apos;s Trust Score.
        </ThemedText>
      </View>
      <Button label="Done" onPress={onDone} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
    borderRadius: Spacing.five,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.one,
  },
  hero: {
    alignItems: 'center',
    gap: Spacing.two,
  },
  title: {
    fontSize: 26,
    lineHeight: 32,
    fontWeight: 700,
    textAlign: 'center',
  },
  center: {
    textAlign: 'center',
  },
  starsBlock: {
    alignItems: 'center',
    gap: Spacing.two,
  },
  stars: {
    flexDirection: 'row',
    gap: Spacing.three,
  },
  spacer: {
    flex: 1,
  },
  footer: {
    gap: Spacing.two,
  },
  thanks: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.two,
  },
  thanksIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.two,
  },
  thanksTitle: {
    fontSize: 22,
    lineHeight: 28,
    fontWeight: 700,
  },
  ratingLine: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
  },
});
