import { SymbolView } from 'expo-symbols';
import { useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  View,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Banner } from '@/components/ui/banner';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Icons } from '@/constants/icons';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

// shown with the terms so it's clear which text was accepted (backend TERMS_VERSION)
export const TERMS_VERSION = '2026-10';

const KEY_POINTS = [
  'Drivers are coworkers going your way, not hired drivers.',
  'Contributions only cover shared trip costs. There are no fares and no profit.',
  "WorkPool matches colleagues. It doesn't provide transport.",
];

const TERMS = [
  {
    title: '1. Cost sharing only',
    body: "A rider's contribution may not be more than their share of fuel, tolls and parking for the trip. Drivers may not set amounts to make a profit.",
  },
  {
    title: '2. Not a hiring service',
    body: 'Under Sri Lankan law, carrying passengers for hire needs a commercial permit. WorkPool rides are not for hire, and you agree not to use them that way.',
  },
  {
    title: '3. Verified coworkers',
    body: 'Only people whose identity (NIC) and workplace (LinkedIn) are verified by WorkPool can share rides. Keep your profile accurate.',
  },
  {
    title: "4. Drivers' responsibilities",
    body: 'If you drive, you need a valid licence, insurance and a roadworthy vehicle.',
  },
  {
    title: '5. Your data',
    body: 'WorkPool uses your location to match rides and only ever shows other users an approximate point. Your NIC is visible to WorkPool admins only.',
  },
];

// a few pixels of slack so "at the bottom" works on every screen density
const END_TOLERANCE = 4;

interface TermsStepProps {
  submitting: boolean;
  error: string | null;
  onBack: () => void;
  onAccept: () => void;
}

// Step 2 of sign-up: the cost-sharing terms. The checkboxes unlock only after
// scrolling to the end, and the account is created only when both are ticked.
export function TermsStep({ submitting, error, onBack, onAccept }: TermsStepProps) {
  const theme = useTheme();
  const [read, setRead] = useState(false);
  const [boxHeight, setBoxHeight] = useState(0);
  const [understood, setUnderstood] = useState(false);
  const [agreed, setAgreed] = useState(false);

  function onScroll(event: NativeSyntheticEvent<NativeScrollEvent>) {
    const { contentOffset, layoutMeasurement, contentSize } = event.nativeEvent;
    if (contentOffset.y + layoutMeasurement.height >= contentSize.height - END_TOLERANCE) {
      setRead(true);
    }
  }

  // on a tall screen the terms may fit without scrolling, so nothing to scroll to
  function onContentSizeChange(_width: number, height: number) {
    if (boxHeight > 0 && height <= boxHeight + END_TOLERANCE) setRead(true);
  }

  return (
    <>
      <View style={styles.headingGroup}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Back to your details"
          onPress={onBack}
          disabled={submitting}
          style={styles.titleRow}
          hitSlop={8}>
          <SymbolView name={Icons.back} size={20} tintColor={theme.text} />
          <ThemedText type="title" style={styles.title}>
            Before you ride
          </ThemedText>
        </Pressable>
        <ThemedText themeColor="textSecondary">Read and accept to finish signing up.</ThemedText>
      </View>

      <View style={[styles.keyBox, { backgroundColor: theme.primarySoft }]}>
        <ThemedText type="smallBold" themeColor="primarySoftText">
          WorkPool is a cost-sharing platform, not a taxi or paid ride service.
        </ThemedText>
        {KEY_POINTS.map((point) => (
          <View key={point} style={styles.point}>
            <SymbolView name={Icons.check} size={14} tintColor={theme.primary} />
            <ThemedText type="small" style={styles.grow}>
              {point}
            </ThemedText>
          </View>
        ))}
      </View>

      <View style={styles.termsGroup}>
        <ScrollView
          style={[styles.termsBox, { backgroundColor: theme.backgroundElement, borderColor: theme.border }]}
          contentContainerStyle={styles.termsContent}
          nestedScrollEnabled
          onScroll={onScroll}
          scrollEventThrottle={50}
          onLayout={(event) => setBoxHeight(event.nativeEvent.layout.height)}
          onContentSizeChange={onContentSizeChange}>
          {TERMS.map((term) => (
            <View key={term.title} style={styles.term}>
              <ThemedText type="smallBold">{term.title}</ThemedText>
              <ThemedText type="small" themeColor="textSecondary">
                {term.body}
              </ThemedText>
            </View>
          ))}
          <ThemedText type="small" themeColor="textSecondary">
            Terms version {TERMS_VERSION}
          </ThemedText>
        </ScrollView>

        <View style={styles.readRow}>
          <SymbolView
            name={read ? Icons.check : Icons.arrowDown}
            size={12}
            tintColor={read ? theme.primary : theme.textSecondary}
          />
          <ThemedText type="small" themeColor="textSecondary">
            {read ? 'Terms read' : 'Scroll to the end to continue'}
          </ThemedText>
        </View>
      </View>

      <Checkbox checked={understood} onChange={setUnderstood} disabled={!read || submitting}>
        I understand WorkPool is for sharing trip costs with coworkers, not a paid ride or taxi
        service.
      </Checkbox>
      <Checkbox checked={agreed} onChange={setAgreed} disabled={!read || submitting}>
        I agree to the Terms & Conditions and Privacy Policy.
      </Checkbox>

      {error && <Banner message={error} />}

      <Button
        label="Create account"
        onPress={onAccept}
        disabled={!(read && understood && agreed)}
        loading={submitting}
      />
    </>
  );
}

const styles = StyleSheet.create({
  headingGroup: {
    gap: Spacing.one,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  title: {
    fontSize: 28,
    lineHeight: 34,
  },
  grow: {
    flex: 1,
  },
  keyBox: {
    borderRadius: Spacing.four,
    padding: Spacing.three,
    gap: Spacing.two,
  },
  point: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.two,
  },
  termsGroup: {
    gap: Spacing.two,
  },
  termsBox: {
    height: 170,
    borderWidth: 1.5,
    borderRadius: Spacing.three,
  },
  termsContent: {
    padding: Spacing.three,
    gap: Spacing.three,
  },
  term: {
    gap: Spacing.half,
  },
  readRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
  },
});
