import { useRouter } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import type { UpdateTravelProfileInput } from '@/api/users.api';
import { ThemedText } from '@/components/themed-text';
import { DaySelector } from '@/components/travel/day-selector';
import { MapLocationField } from '@/components/travel/map-location-field';
import { RoleSelector } from '@/components/travel/role-selector';
import { TimeField } from '@/components/travel/time-field';
import { Banner } from '@/components/ui/banner';
import { Button } from '@/components/ui/button';
import { Screen } from '@/components/ui/screen';
import { Skeleton } from '@/components/ui/skeleton';
import { Icons } from '@/constants/icons';
import { PreferredRole } from '@/constants/preferred-role.enum';
import { Spacing } from '@/constants/theme';
import { Weekday } from '@/constants/weekday.enum';
import { useTheme } from '@/hooks/use-theme';
import { useAuthStore } from '@/stores/useAuthStore';
import type { GeoPoint, TravelProfile } from '@/types/user.types';
import { getErrorMessage } from '@/utils/errors';

interface FormState {
  homeLocation?: GeoPoint;
  workLocation?: GeoPoint;
  workStartTime?: string;
  workEndTime?: string;
  daysAvailable: Weekday[];
  preferredRole?: PreferredRole;
}

function toFormState(profile?: TravelProfile): FormState {
  return {
    homeLocation: profile?.homeLocation,
    workLocation: profile?.workLocation,
    workStartTime: profile?.workStartTime,
    workEndTime: profile?.workEndTime,
    daysAvailable: profile?.daysAvailable ?? [],
    preferredRole: profile?.preferredRole,
  };
}

function toPayload(form: FormState): UpdateTravelProfileInput {
  const payload: UpdateTravelProfileInput = { daysAvailable: form.daysAvailable };
  if (form.homeLocation) payload.homeLocation = form.homeLocation;
  if (form.workLocation) payload.workLocation = form.workLocation;
  if (form.workStartTime) payload.workStartTime = form.workStartTime;
  if (form.workEndTime) payload.workEndTime = form.workEndTime;
  if (form.preferredRole) payload.preferredRole = form.preferredRole;
  return payload;
}

export default function TravelProfileScreen() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const refreshMe = useAuthStore((state) => state.refreshMe);
  const updateTravelProfile = useAuthStore((state) => state.updateTravelProfile);

  const saved = user?.travelProfile;
  const [form, setForm] = useState<FormState>(() => toFormState(saved));
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Seed the form from the loaded profile once, per account. On a cold start `user` is
  // null at mount, so the initial useState value is empty — this render-phase adjustment
  // (React's "storing info from previous renders" pattern) fills it in when the profile
  // arrives, and re-seeds only if the account changes, never on a background refresh.
  const [seededUserId, setSeededUserId] = useState(user?.id);
  if (user && user.id !== seededUserId) {
    setSeededUserId(user.id);
    setForm(toFormState(user.travelProfile));
  }

  useEffect(() => {
    void refreshMe().catch((err) => setLoadError(getErrorMessage(err)));
  }, [refreshMe]);

  function patch(next: Partial<FormState>) {
    setForm((current) => ({ ...current, ...next }));
  }

  async function handleSave() {
    setSaveError(null);
    setIsSaving(true);
    try {
      await updateTravelProfile(toPayload(form));
      router.back();
    } catch (err) {
      setSaveError(getErrorMessage(err));
    } finally {
      setIsSaving(false);
    }
  }

  function handleDiscard() {
    setForm(toFormState(saved));
    setSaveError(null);
  }

  if (!user) {
    return (
      <Screen
        header={<BackHeader onBack={() => router.back()} />}
        underTabBar>
        {loadError ? <Banner message={loadError} /> : <TravelProfileSkeleton />}
      </Screen>
    );
  }

  return (
    <Screen
      header={<BackHeader onBack={() => router.back()} />}
      underTabBar>
      <View style={styles.headingGroup}>
        <ThemedText type="title" style={styles.title}>
          Travel profile
        </ThemedText>
        <ThemedText themeColor="textSecondary">Used to match you with nearby coworkers.</ThemedText>
      </View>

      {saveError && <Banner message="Couldn't save your travel profile. Try again." />}

      <Banner
        tone="success"
        icon="eyeHide"
        message="Only an approximate location is ever shown to other riders — never your exact address."
      />

      <MapLocationField
        label="HOME LOCATION"
        kind="home"
        point={form.homeLocation}
        onChange={(point) => patch({ homeLocation: point })}
      />
      <MapLocationField
        label="WORK LOCATION"
        kind="work"
        point={form.workLocation}
        onChange={(point) => patch({ workLocation: point })}
      />

      <View style={styles.timeRow}>
        <TimeField
          label="START TIME"
          value={form.workStartTime}
          onChange={(value) => patch({ workStartTime: value })}
        />
        <TimeField
          label="END TIME"
          value={form.workEndTime}
          onChange={(value) => patch({ workEndTime: value })}
        />
      </View>

      <View style={styles.section}>
        <ThemedText type="smallBold" themeColor="textSecondary" style={styles.sectionLabel}>
          COMMUTE DAYS
        </ThemedText>
        <DaySelector value={form.daysAvailable} onChange={(days) => patch({ daysAvailable: days })} />
      </View>

      <View style={styles.section}>
        <ThemedText type="smallBold" themeColor="textSecondary" style={styles.sectionLabel}>
          PREFERRED ROLE
        </ThemedText>
        <RoleSelector value={form.preferredRole} onChange={(role) => patch({ preferredRole: role })} />
      </View>

      <Button
        label={saveError ? 'Retry save' : 'Save travel profile'}
        onPress={handleSave}
        loading={isSaving}
      />
      {saveError && (
        <Button label="Discard changes" variant="text" onPress={handleDiscard} disabled={isSaving} />
      )}
    </Screen>
  );
}

function BackHeader({ onBack }: { onBack: () => void }) {
  const theme = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Back to profile"
      onPress={onBack}
      hitSlop={8}
      style={[styles.backButton, { borderColor: theme.border }]}>
      <SymbolView name={Icons.back} size={16} tintColor={theme.text} />
    </Pressable>
  );
}

function TravelProfileSkeleton() {
  return (
    <>
      <Skeleton width={180} height={28} />
      <Skeleton height={56} radius={Spacing.three} />
      <Skeleton height={128} radius={Spacing.three} />
      <Skeleton height={128} radius={Spacing.three} />
      <View style={styles.timeRow}>
        <Skeleton height={48} />
        <Skeleton height={48} />
      </View>
      <Skeleton height={44} />
      <Skeleton height={64} radius={Spacing.three} />
    </>
  );
}

const styles = StyleSheet.create({
  backButton: {
    width: 36,
    height: 36,
    borderRadius: Spacing.two,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headingGroup: {
    gap: Spacing.one,
  },
  title: {
    fontSize: 32,
    lineHeight: 38,
  },
  timeRow: {
    flexDirection: 'row',
    gap: Spacing.three,
  },
  section: {
    gap: Spacing.two,
  },
  sectionLabel: {
    letterSpacing: 0.4,
  },
});
