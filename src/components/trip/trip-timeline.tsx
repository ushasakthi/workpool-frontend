import { SymbolView } from 'expo-symbols';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Icons } from '@/constants/icons';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import type { TimelineStep } from '@/types/trip.types';

// vertical list of steps joined by a line, like the route line
export function TripTimeline({ steps }: { steps: TimelineStep[] }) {
  const theme = useTheme();

  return (
    <View>
      {steps.map((step, index) => {
        const last = index === steps.length - 1;
        return (
          <View key={step.label} style={styles.row}>
            <View style={styles.rail}>
              <View style={styles.marker}>
                {step.state === 'done' ? (
                  <SymbolView name={Icons.checkCircle} size={20} tintColor={theme.primary} />
                ) : (
                  <View
                    style={[
                      styles.dot,
                      step.state === 'current'
                        ? { backgroundColor: theme.primary }
                        : { borderWidth: 2, borderColor: theme.textSecondary },
                    ]}
                  />
                )}
              </View>
              {!last && (
                <View
                  style={[
                    styles.line,
                    { backgroundColor: step.state === 'done' ? theme.primary : theme.border },
                  ]}
                />
              )}
            </View>
            <View style={[styles.text, !last && styles.textGap]}>
              <View style={styles.labelRow}>
                <ThemedText
                  type={step.state === 'current' ? 'smallBold' : 'small'}
                  themeColor={step.state === 'todo' ? 'textSecondary' : 'text'}>
                  {step.label}
                </ThemedText>
                {step.time && (
                  <ThemedText type="small" themeColor="textSecondary">
                    {step.time}
                  </ThemedText>
                )}
              </View>
              {step.note && (
                <ThemedText type="small" themeColor="textSecondary">
                  {step.note}
                </ThemedText>
              )}
            </View>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: Spacing.three,
  },
  rail: {
    width: 20,
    alignItems: 'center',
  },
  marker: {
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  line: {
    flex: 1,
    width: 2,
    minHeight: 14,
  },
  text: {
    flex: 1,
    gap: 2,
  },
  textGap: {
    paddingBottom: Spacing.three,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});
