import { SymbolView } from 'expo-symbols';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { Icons } from '@/constants/icons';
import { PreferredRole } from '@/constants/preferred-role.enum';
import { Spacing } from '@/constants/theme';
import { WEEKDAYS_IN_ORDER } from '@/constants/weekday.enum';
import { useTheme } from '@/hooks/use-theme';
import type { TravelProfile } from '@/types/user.types';
import { formatHhMmForDisplay } from '@/utils/time';
import { TRAVEL_STEPS, travelStepsDone } from '@/utils/travel';

const ROLE_LABELS: Record<PreferredRole, string> = {
  [PreferredRole.DRIVER]: 'Driver',
  [PreferredRole.PASSENGER]: 'Passenger',
  [PreferredRole.EITHER]: 'Either',
};

interface TravelSummaryCardProps {
  profile?: TravelProfile;
  onEdit: () => void;
}

export function TravelSummaryCard({ profile, onEdit }: TravelSummaryCardProps) {
  const theme = useTheme();
  const done = travelStepsDone(profile);

  if (!profile || done < TRAVEL_STEPS) {
    return <SetUpCard done={done} onSetUp={onEdit} />;
  }

  const days = profile.daysAvailable;

  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <ThemedText type="smallBold" themeColor="textSecondary" style={styles.sectionLabel}>
          TRAVEL PROFILE
        </ThemedText>
        <Pressable accessibilityRole="button" onPress={onEdit} hitSlop={8}>
          <ThemedText type="smallBold" themeColor="primary" style={styles.editLink}>
            Edit
          </ThemedText>
        </Pressable>
      </View>

      <View style={[styles.card, { backgroundColor: theme.backgroundElement }]}>
        <View style={styles.route}>
          <View style={styles.markers}>
            <View style={[styles.dot, { backgroundColor: theme.primary }]} />
            <View style={[styles.line, { backgroundColor: theme.border }]} />
            <View style={[styles.dot, { backgroundColor: theme.accent }]} />
          </View>
          <View style={styles.stops}>
            <Stop caption="Home" place={profile.homeLocation?.label} />
            <Stop caption="Work" place={profile.workLocation?.label} />
          </View>
        </View>

        <View style={styles.hours}>
          <SymbolView name={Icons.clock} size={17} tintColor={theme.textSecondary} />
          <ThemedText type="smallBold" style={styles.hoursText}>
            {formatHhMmForDisplay(profile.workStartTime ?? '')} –{' '}
            {formatHhMmForDisplay(profile.workEndTime ?? '')}
          </ThemedText>
        </View>

        <View style={styles.days}>
          {WEEKDAYS_IN_ORDER.map((day, index) => {
            const on = days.includes(day.value);
            return (
              <View
                key={`${day.value}-${index}`}
                style={[styles.dayChip, { backgroundColor: on ? theme.primarySoft : theme.background }]}>
                <ThemedText
                  type={on ? 'smallBold' : 'small'}
                  themeColor={on ? 'primarySoftText' : 'textSecondary'}>
                  {day.short}
                </ThemedText>
              </View>
            );
          })}
        </View>

        {profile.preferredRole && (
          <View style={[styles.prefers, { borderTopColor: theme.border }]}>
            <ThemedText themeColor="textSecondary">Prefers</ThemedText>
            <ThemedText type="smallBold" style={styles.prefersValue}>
              {ROLE_LABELS[profile.preferredRole]}
            </ThemedText>
          </View>
        )}
      </View>
    </View>
  );
}

function Stop({ caption, place }: { caption: string; place?: string }) {
  return (
    <View>
      <ThemedText type="small" themeColor="textSecondary" style={styles.caption}>
        {caption}
      </ThemedText>
      <ThemedText type="smallBold" style={styles.place} numberOfLines={1}>
        {place ?? 'Pin set on map'}
      </ThemedText>
    </View>
  );
}

function SetUpCard({ done, onSetUp }: { done: number; onSetUp: () => void }) {
  const theme = useTheme();
  return (
    <View style={[styles.setUpCard, { backgroundColor: theme.primarySoft }]}>
      <View style={styles.setUpHeader}>
        <ThemedText type="smallBold" themeColor="primarySoftText" style={styles.setUpTitle}>
          Set up your commute
        </ThemedText>
        <ThemedText type="small" themeColor="primarySoftText">
          {done} of {TRAVEL_STEPS} done
        </ThemedText>
      </View>
      <View style={styles.progress}>
        {Array.from({ length: TRAVEL_STEPS }).map((_, index) => (
          <View
            key={index}
            style={[
              styles.progressStep,
              { backgroundColor: index < done ? theme.primary : theme.background },
            ]}
          />
        ))}
      </View>
      <ThemedText>Add your route, hours and days so we can match you with coworkers.</ThemedText>
      <Button label="Set up travel profile" onPress={onSetUp} />
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: Spacing.two,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionLabel: {
    fontSize: 12,
    letterSpacing: 0.7,
  },
  editLink: {
    fontSize: 15,
  },
  card: {
    borderRadius: Spacing.three,
    padding: Spacing.three,
    gap: Spacing.three,
  },
  route: {
    flexDirection: 'row',
    gap: 12,
  },
  markers: {
    alignItems: 'center',
    paddingTop: 22,
    paddingBottom: 6,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  line: {
    width: 2,
    flex: 1,
    minHeight: 24,
    marginVertical: Spacing.one,
  },
  stops: {
    flex: 1,
    gap: 14,
  },
  caption: {
    fontSize: 12,
    lineHeight: 16,
  },
  place: {
    fontSize: 16,
    lineHeight: 22,
  },
  hours: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  hoursText: {
    fontSize: 15,
  },
  days: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: Spacing.one,
  },
  dayChip: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  prefers: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    paddingTop: 12,
  },
  prefersValue: {
    fontSize: 15,
  },
  setUpCard: {
    borderRadius: Spacing.three,
    padding: 18,
    gap: 12,
  },
  setUpHeader: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    gap: Spacing.two,
  },
  setUpTitle: {
    fontSize: 18,
  },
  progress: {
    flexDirection: 'row',
    gap: Spacing.one,
  },
  progressStep: {
    flex: 1,
    height: 4,
    borderRadius: 2,
  },
});
