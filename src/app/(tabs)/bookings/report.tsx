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
import { ReportCategory } from '@/constants/report-category.enum';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useBookingStore } from '@/stores/useBookingStore';
import { getErrorMessage } from '@/utils/errors';
import { REPORT_CATEGORY_LABEL } from '@/utils/reports';
import { formatRideSchedule } from '@/utils/schedule';

const MAX_REASON = 500;

const CATEGORIES = Object.values(ReportCategory).map((value) => ({
  value,
  label: REPORT_CATEGORY_LABEL[value],
}));

export default function ReportIssueScreen() {
  const router = useRouter();
  const { bookingId } = useLocalSearchParams<{ bookingId: string }>();
  const booking = useBookingStore(
    (state) =>
      state.myBookings?.find((b) => b.id === bookingId) ??
      state.requests?.find((b) => b.id === bookingId),
  );
  const reportIssue = useBookingStore((state) => state.reportIssue);

  const [category, setCategory] = useState<ReportCategory | null>(null);
  const [reason, setReason] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!booking) {
    return (
      <Screen underTabBar>
        <ThemedText style={styles.headerTitle}>Couldn&apos;t find this ride</ThemedText>
        <Button label="Go back" variant="soft" onPress={() => router.back()} />
      </Screen>
    );
  }

  const name = booking.otherParty.name;
  const firstName = name.split(' ')[0];
  const categoryLabel = CATEGORIES.find((c) => c.value === category)?.label ?? '';

  async function send() {
    if (!category) return;
    setError(null);
    setSending(true);
    try {
      await reportIssue({ bookingId, category, reason: reason.trim() || undefined });
      setSent(true);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSending(false);
    }
  }

  if (sent) {
    return (
      <ReceivedState
        firstName={firstName}
        categoryLabel={categoryLabel}
        onBack={() => router.back()}
      />
    );
  }

  return (
    <Screen header={<CloseHeader onClose={() => router.back()} />} underTabBar>
      <RideSummary
        name={name}
        schedule={formatRideSchedule(booking.ride.daysOfWeek, booking.ride.departureTime)}
      />

      <View style={styles.section}>
        <ThemedText type="smallBold">What happened?</ThemedText>
        <View style={styles.chips}>
          {CATEGORIES.map((option) => (
            <CategoryChip
              key={option.value}
              label={option.label}
              selected={category === option.value}
              disabled={sending}
              onPress={() => setCategory(option.value)}
            />
          ))}
        </View>
      </View>

      <TextField
        label="Tell us more (optional)"
        labelRight={
          <ThemedText type="small" themeColor="textSecondary">
            {reason.length}/{MAX_REASON}
          </ThemedText>
        }
        value={reason}
        onChangeText={setReason}
        maxLength={MAX_REASON}
        multiline
        placeholder="Add what you remember — time, place, what was said."
        editable={!sending}
      />

      <ConfidentialNote firstName={firstName} />

      {error && <Banner message={error} />}

      <View style={styles.spacer} />

      <View style={styles.footer}>
        <Button
          label="Send report"
          loading={sending}
          disabled={category === null}
          onPress={() => void send()}
        />
        <ThemedText type="small" themeColor="textSecondary" style={styles.center}>
          In danger right now? Call 119 (Police).
        </ThemedText>
      </View>
    </Screen>
  );
}

function CategoryChip({
  label,
  selected,
  disabled,
  onPress,
}: {
  label: string;
  selected: boolean;
  disabled: boolean;
  onPress: () => void;
}) {
  const theme = useTheme();
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      disabled={disabled}
      onPress={onPress}
      style={[
        styles.chip,
        { borderColor: selected ? theme.primary : theme.border },
        selected && { backgroundColor: theme.primarySoft },
      ]}>
      {selected && <SymbolView name={Icons.check} size={14} tintColor={theme.primary} />}
      <ThemedText type="small" themeColor={selected ? 'primarySoftText' : 'text'}>
        {label}
      </ThemedText>
    </Pressable>
  );
}

function RideSummary({ name, schedule }: { name: string; schedule: string }) {
  const theme = useTheme();
  return (
    <View style={[styles.rideCard, { borderColor: theme.border }]}>
      <Avatar name={name} size={40} />
      <View>
        <ThemedText type="smallBold">Ride with {name}</ThemedText>
        <ThemedText type="small" themeColor="textSecondary">
          {schedule} · to work
        </ThemedText>
      </View>
    </View>
  );
}

function ConfidentialNote({ firstName }: { firstName: string }) {
  const theme = useTheme();
  return (
    <View style={[styles.note, { backgroundColor: theme.backgroundElement }]}>
      <SymbolView name={Icons.lock} size={16} tintColor={theme.text} />
      <ThemedText type="small" style={styles.grow}>
        <ThemedText type="smallBold">Reports are confidential. </ThemedText>
        {firstName} won&apos;t see who reported this or what you wrote.
      </ThemedText>
    </View>
  );
}

function ReceivedState({
  firstName,
  categoryLabel,
  onBack,
}: {
  firstName: string;
  categoryLabel: string;
  onBack: () => void;
}) {
  const theme = useTheme();
  return (
    <Screen underTabBar>
      <View style={styles.received}>
        <View style={[styles.receivedIcon, { backgroundColor: theme.primarySoft }]}>
          <SymbolView name={Icons.shieldCheck} size={30} tintColor={theme.primary} />
        </View>
        <ThemedText style={styles.receivedTitle}>Report received</ThemedText>
        <ThemedText themeColor="textSecondary" style={styles.center}>
          Our team will review it. {firstName} isn&apos;t told who reported.
        </ThemedText>
        <View style={[styles.receivedPill, { backgroundColor: theme.backgroundElement }]}>
          <SymbolView name={Icons.lock} size={14} tintColor={theme.text} />
          <ThemedText type="smallBold">Confidential · {categoryLabel}</ThemedText>
        </View>
      </View>
      <Button label="Back to booking" onPress={onBack} />
    </Screen>
  );
}

function CloseHeader({ onClose }: { onClose: () => void }) {
  const theme = useTheme();
  return (
    <View style={styles.header}>
      <Pressable accessibilityRole="button" accessibilityLabel="Close" onPress={onClose} hitSlop={8}>
        <SymbolView name={Icons.close} size={20} tintColor={theme.text} />
      </Pressable>
      <ThemedText style={styles.headerTitle}>Report an issue</ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
  },
  headerTitle: {
    fontSize: 24,
    lineHeight: 30,
    fontWeight: 700,
  },
  grow: {
    flex: 1,
  },
  center: {
    textAlign: 'center',
  },
  rideCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    borderWidth: 1,
    borderRadius: Spacing.four,
    padding: Spacing.three,
  },
  section: {
    gap: Spacing.two,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
    borderWidth: 1.5,
    borderRadius: Spacing.five,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
  },
  note: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.two,
    borderRadius: Spacing.three,
    padding: Spacing.three,
  },
  spacer: {
    flex: 1,
  },
  footer: {
    gap: Spacing.two,
  },
  received: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.two,
  },
  receivedIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.two,
  },
  receivedTitle: {
    fontSize: 22,
    lineHeight: 28,
    fontWeight: 700,
  },
  receivedPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
    borderRadius: Spacing.five,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.one,
    marginTop: Spacing.two,
  },
});
