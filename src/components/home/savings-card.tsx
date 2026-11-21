import { SymbolView } from 'expo-symbols';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { CardError } from '@/components/home/card-error';
import { ThemedText } from '@/components/themed-text';
import { Skeleton } from '@/components/ui/skeleton';
import { Icons } from '@/constants/icons';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import type { Savings } from '@/types/booking.types';
import { formatCost } from '@/utils/formatters';
import { formatMonthName } from '@/utils/time';

type Side = 'passenger' | 'driver';

interface SavingsCardProps {
  // null = loading
  savings: Savings | null;
  error: string | null;
  // passengers and drivers have one side; "both" users get a toggle
  sides: Side[];
  onOpen: () => void;
  onRetry: () => void;
}

export function SavingsCard({ savings, error, sides, onOpen, onRetry }: SavingsCardProps) {
  const theme = useTheme();
  const [side, setSide] = useState<Side>(sides[0]);

  if (error) return <CardError message="Couldn't load savings" onRetry={onRetry} />;
  if (!savings) return <Skeleton height={200} radius={Spacing.three} />;

  const isDriver = side === 'driver';
  const rides = isDriver ? savings.asDriver.rides : savings.asPassenger.rides;
  const amount = isDriver ? savings.asDriver.costsShared : savings.asPassenger.saved;
  const co2 = isDriver ? savings.asDriver.co2SavedKg : savings.asPassenger.co2SavedKg;

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onOpen}
      style={[styles.card, { backgroundColor: theme.primarySoft }]}>
      <View style={styles.topRow}>
        <ThemedText type="smallBold" themeColor="primarySoftText" style={styles.label}>
          {formatMonthName(savings.month).toUpperCase()} SAVINGS
        </ThemedText>
        {sides.length > 1 && <SideToggle value={side} onChange={setSide} />}
      </View>

      {rides === 0 ? (
        <View style={styles.emptyRow}>
          <SymbolView name={Icons.leaf} size={24} tintColor={theme.primarySoftText} />
          <ThemedText type="smallBold" themeColor="primarySoftText" style={styles.emptyText}>
            Your savings start with your first shared ride
          </ThemedText>
        </View>
      ) : (
        <>
          <View>
            <ThemedText
              themeColor="primarySoftText"
              style={styles.amount}
              numberOfLines={1}
              adjustsFontSizeToFit>
              {formatCost(amount)}
            </ThemedText>
            <ThemedText>{isDriver ? 'costs shared with riders' : 'saved vs. driving alone'}</ThemedText>
          </View>

          <View style={styles.chips}>
            <Chip icon="car" text={`${rides} ride${rides === 1 ? '' : 's'}`} />
            <Chip icon="leaf" text={`${co2.toFixed(1)} kg CO₂`} />
          </View>

          <View style={styles.bottomRow}>
            <ThemedText type="small" themeColor="textSecondary">
              {savings.isCurrentMonth ? 'Month in progress · estimate' : 'Estimate'}
            </ThemedText>
            <ThemedText type="smallBold" themeColor="primarySoftText">
              See details →
            </ThemedText>
          </View>
        </>
      )}
    </Pressable>
  );
}

function SideToggle({ value, onChange }: { value: Side; onChange: (side: Side) => void }) {
  const theme = useTheme();
  const options: { value: Side; label: string }[] = [
    { value: 'passenger', label: 'Passenger' },
    { value: 'driver', label: 'Driver' },
  ];

  return (
    <View style={[styles.toggle, { backgroundColor: theme.background }]}>
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <Pressable
            key={option.value}
            accessibilityRole="tab"
            accessibilityState={{ selected }}
            onPress={() => onChange(option.value)}
            style={[styles.toggleOption, selected && { backgroundColor: theme.primary }]}>
            <ThemedText
              type="small"
              themeColor={selected ? 'onPrimary' : 'textSecondary'}
              style={styles.toggleText}>
              {option.label}
            </ThemedText>
          </Pressable>
        );
      })}
    </View>
  );
}

function Chip({ icon, text }: { icon: keyof typeof Icons; text: string }) {
  const theme = useTheme();
  return (
    <View style={[styles.chip, { backgroundColor: theme.background }]}>
      <SymbolView name={Icons[icon]} size={15} tintColor={theme.primarySoftText} />
      <ThemedText type="smallBold">{text}</ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: Spacing.three,
    padding: 18,
    gap: 14,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.two,
  },
  label: {
    fontSize: 12,
    letterSpacing: 0.7,
  },
  amount: {
    fontSize: 44,
    lineHeight: 50,
    fontWeight: 800,
    fontVariant: ['tabular-nums'],
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.two,
  },
  emptyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  emptyText: {
    flex: 1,
    fontSize: 16,
  },
  toggle: {
    flexDirection: 'row',
    borderRadius: 999,
    padding: 2,
  },
  toggleOption: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  toggleText: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: 600,
  },
});
