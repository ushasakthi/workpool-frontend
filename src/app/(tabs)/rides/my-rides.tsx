import { Redirect, useRouter } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';

import { RideCard } from '@/components/rides/ride-card';
import { RidesSegment } from '@/components/rides/rides-segment';
import { ThemedText } from '@/components/themed-text';
import { Banner } from '@/components/ui/banner';
import { Screen } from '@/components/ui/screen';
import { Skeleton } from '@/components/ui/skeleton';
import { StateMessage } from '@/components/ui/state-message';
import { Icons } from '@/constants/icons';
import { RideStatus } from '@/constants/ride-status.enum';
import { Spacing } from '@/constants/theme';
import { UserRole } from '@/constants/user-role.enum';
import { useTheme } from '@/hooks/use-theme';
import { useAuthStore } from '@/stores/useAuthStore';
import { useRideStore } from '@/stores/useRideStore';
import type { Ride } from '@/types/ride.types';
import { getErrorMessage } from '@/utils/errors';

const PROVIDER_ROLES: UserRole[] = [UserRole.DRIVER, UserRole.BOTH];

export default function MyRidesScreen() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const rides = useRideStore((state) => state.rides);
  const load = useRideStore((state) => state.load);
  const setStatus = useRideStore((state) => state.setStatus);

  const [loadError, setLoadError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [confirmCancelId, setConfirmCancelId] = useState<string | null>(null);

  const isProvider = user ? PROVIDER_ROLES.includes(user.role) : false;

  useEffect(() => {
    if (!isProvider) return;
    void load().catch((err) => setLoadError(getErrorMessage(err)));
  }, [isProvider, load]);

  if (user && !isProvider) {
    return <Redirect href="/rides/search" />;
  }

  function retryLoad() {
    setLoadError(null);
    void load().catch((err) => setLoadError(getErrorMessage(err)));
  }

  async function changeStatus(ride: Ride, status: RideStatus) {
    setActionError(null);
    setConfirmCancelId(null);
    setBusyId(ride.id);
    try {
      await setStatus(ride.id, status);
    } catch (err) {
      setActionError(getErrorMessage(err));
    } finally {
      setBusyId(null);
    }
  }

  return (
    <Screen header={<RidesSegment active="my-rides" />} underTabBar>
      <ListHeader onAdd={() => router.push('/rides/post')} />

      {actionError && <Banner message={actionError} />}

      {rides === null ? (
        loadError ? (
          <LoadError message={loadError} onRetry={retryLoad} />
        ) : (
          <MyRidesSkeleton />
        )
      ) : rides.length === 0 ? (
        <MyRidesEmpty onPost={() => router.push('/rides/post')} />
      ) : (
        rides.map((ride) => (
          <RideCard key={ride.id} ride={ride}>
            <RideOwnerFooter
              ride={ride}
              busy={busyId === ride.id}
              confirming={confirmCancelId === ride.id}
              onSetStatus={(status) => void changeStatus(ride, status)}
              onEdit={() =>
                router.push({ pathname: '/rides/post', params: { id: ride.id } })
              }
              onAskCancel={() => setConfirmCancelId(ride.id)}
              onDismissCancel={() => setConfirmCancelId(null)}
            />
          </RideCard>
        ))
      )}
    </Screen>
  );
}

function ListHeader({ onAdd }: { onAdd: () => void }) {
  const theme = useTheme();
  return (
    <View style={styles.headerRow}>
      <View style={styles.headerText}>
        <ThemedText type="title" style={styles.title}>
          My rides
        </ThemedText>
        <ThemedText themeColor="textSecondary">
          Rides you&apos;re driving for coworkers.
        </ThemedText>
      </View>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Post a ride"
        onPress={onAdd}
        style={[styles.addButton, { backgroundColor: theme.primary }]}>
        <SymbolView name={Icons.add} size={20} tintColor={theme.onPrimary} />
      </Pressable>
    </View>
  );
}

function RideOwnerFooter({
  ride,
  busy,
  confirming,
  onSetStatus,
  onEdit,
  onAskCancel,
  onDismissCancel,
}: {
  ride: Ride;
  busy: boolean;
  confirming: boolean;
  onSetStatus: (status: RideStatus) => void;
  onEdit: () => void;
  onAskCancel: () => void;
  onDismissCancel: () => void;
}) {
  if (ride.status === RideStatus.CANCELLED) {
    return (
      <ThemedText type="small" themeColor="textSecondary">
        This ride was cancelled.
      </ThemedText>
    );
  }

  if (confirming) {
    return (
      <>
        <ThemedText type="smallBold" style={styles.grow}>
          Cancel this ride?
        </ThemedText>
        <FooterButton label="Keep" onPress={onDismissCancel} />
        <FooterButton
          label="Yes, cancel"
          tone="danger"
          busy={busy}
          onPress={() => onSetStatus(RideStatus.CANCELLED)}
        />
      </>
    );
  }

  const paused = ride.status === RideStatus.PAUSED;
  return (
    <>
      <FooterButton
        icon={paused ? 'play' : 'pause'}
        label={paused ? 'Resume' : 'Pause'}
        busy={busy}
        onPress={() =>
          onSetStatus(paused ? RideStatus.ACTIVE : RideStatus.PAUSED)
        }
      />
      <FooterButton icon="pencil" label="Edit" tone="primary" onPress={onEdit} />
      <FooterButton
        icon="close"
        label="Cancel"
        tone="danger"
        onPress={onAskCancel}
      />
    </>
  );
}

function FooterButton({
  icon,
  label,
  tone = 'neutral',
  busy = false,
  onPress,
}: {
  icon?: keyof typeof Icons;
  label: string;
  tone?: 'neutral' | 'primary' | 'danger';
  busy?: boolean;
  onPress: () => void;
}) {
  const theme = useTheme();
  const color =
    tone === 'primary'
      ? theme.primary
      : tone === 'danger'
        ? theme.error
        : theme.textSecondary;
  const background = tone === 'danger' ? theme.errorSoft : theme.backgroundElement;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: busy, busy }}
      onPress={busy ? undefined : onPress}
      style={[styles.footerButton, { backgroundColor: background }]}>
      {busy ? (
        <ActivityIndicator size="small" color={color} />
      ) : (
        icon && <SymbolView name={Icons[icon]} size={15} tintColor={color} />
      )}
      <ThemedText
        type="smallBold"
        style={{ color }}>
        {label}
      </ThemedText>
    </Pressable>
  );
}

function LoadError({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <StateMessage
      icon="wifiSlash"
      tone="error"
      title="Couldn't load your rides"
      message={message}
      action={{ label: 'Try again', variant: 'soft', onPress: onRetry }}
    />
  );
}

function MyRidesEmpty({ onPost }: { onPost: () => void }) {
  return (
    <StateMessage
      icon="route"
      title="You haven't posted a ride yet"
      message="Post your commute so coworkers can join and split the cost."
      action={{ label: 'Post a ride', onPress: onPost }}
    />
  );
}

function MyRidesSkeleton() {
  return (
    <>
      <Skeleton height={132} radius={Spacing.three} />
      <Skeleton height={132} radius={Spacing.three} />
      <Skeleton height={132} radius={Spacing.three} />
    </>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: Spacing.three,
  },
  headerText: {
    flex: 1,
    gap: Spacing.one,
  },
  title: {
    fontSize: 32,
    lineHeight: 38,
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  grow: {
    flex: 1,
  },
  footerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: Spacing.two,
  },
});
