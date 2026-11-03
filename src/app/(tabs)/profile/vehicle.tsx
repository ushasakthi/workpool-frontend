import { useRouter } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Banner } from '@/components/ui/banner';
import { Button } from '@/components/ui/button';
import { Screen } from '@/components/ui/screen';
import { Skeleton } from '@/components/ui/skeleton';
import { StateMessage } from '@/components/ui/state-message';
import { VehicleCard } from '@/components/vehicle/vehicle-card';
import { VehicleForm } from '@/components/vehicle/vehicle-form';
import { Icons } from '@/constants/icons';
import { Spacing } from '@/constants/theme';
import { UserRole } from '@/constants/user-role.enum';
import { useTheme } from '@/hooks/use-theme';
import { useAuthStore } from '@/stores/useAuthStore';
import { useVehicleStore } from '@/stores/useVehicleStore';
import type { Vehicle } from '@/types/vehicle.types';
import { getErrorMessage } from '@/utils/errors';

const PROVIDER_ROLES: UserRole[] = [UserRole.DRIVER, UserRole.BOTH];

type ScreenView =
  | { mode: 'list' }
  | { mode: 'add' }
  | { mode: 'edit'; vehicle: Vehicle };

export default function VehicleScreen() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const vehicles = useVehicleStore((state) => state.vehicles);
  const load = useVehicleStore((state) => state.load);
  const setActive = useVehicleStore((state) => state.setActive);

  const [view, setView] = useState<ScreenView>({ mode: 'list' });
  const [loadError, setLoadError] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [toggleError, setToggleError] = useState<string | null>(null);

  const isProvider = user ? PROVIDER_ROLES.includes(user.role) : false;

  useEffect(() => {
    if (!isProvider) return;
    void load().catch((err) => setLoadError(getErrorMessage(err)));
  }, [isProvider, load]);

  function retryLoad() {
    setLoadError(null);
    void load().catch((err) => setLoadError(getErrorMessage(err)));
  }

  async function handleToggle(vehicle: Vehicle) {
    setToggleError(null);
    setTogglingId(vehicle.id);
    try {
      await setActive(vehicle.id, !vehicle.isActive);
    } catch (err) {
      setToggleError(getErrorMessage(err));
    } finally {
      setTogglingId(null);
    }
  }

  const back = <BackHeader onBack={() => router.back()} />;

  if (!user) {
    return (
      <Screen header={back} underTabBar>
        <VehicleListSkeleton />
      </Screen>
    );
  }

  if (!isProvider) {
    return (
      <Screen header={back} underTabBar>
        <NoticeBlock
          title="Vehicles are for ride providers"
          body="Only accounts registered as a driver can add a vehicle and offer shared rides."
        />
      </Screen>
    );
  }

  if (view.mode !== 'list') {
    return (
      <Screen
        header={<BackHeader onBack={() => setView({ mode: 'list' })} />}
        underTabBar>
        <ThemedText type="title" style={styles.title}>
          {view.mode === 'add' ? 'Add vehicle' : 'Edit vehicle'}
        </ThemedText>
        <VehicleForm
          vehicle={view.mode === 'edit' ? view.vehicle : undefined}
          onDone={() => setView({ mode: 'list' })}
        />
      </Screen>
    );
  }

  if (vehicles === null) {
    return (
      <Screen header={back} underTabBar>
        {loadError ? (
          <View style={styles.loadErrorGroup}>
            <Banner message={loadError} />
            <Button label="Try again" variant="soft" onPress={retryLoad} />
          </View>
        ) : (
          <VehicleListSkeleton />
        )}
      </Screen>
    );
  }

  if (vehicles.length === 0) {
    return (
      <Screen header={back} underTabBar>
        <VehicleEmptyState onAdd={() => setView({ mode: 'add' })} />
      </Screen>
    );
  }

  return (
    <Screen header={back} underTabBar>
      <ListHeader onAdd={() => setView({ mode: 'add' })} />

      {toggleError && <Banner message={toggleError} />}

      {vehicles.map((vehicle) => (
        <VehicleCard
          key={vehicle.id}
          vehicle={vehicle}
          busy={togglingId === vehicle.id}
          onEdit={() => setView({ mode: 'edit', vehicle })}
          onToggleActive={() => void handleToggle(vehicle)}
        />
      ))}
    </Screen>
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
      style={[styles.backButton, { borderColor: theme.border }]}>
      <SymbolView name={Icons.back} size={16} tintColor={theme.text} />
    </Pressable>
  );
}

function ListHeader({ onAdd }: { onAdd: () => void }) {
  const theme = useTheme();
  return (
    <View style={styles.listHeader}>
      <View style={styles.listHeaderText}>
        <ThemedText type="title" style={styles.title}>
          My vehicles
        </ThemedText>
        <ThemedText themeColor="textSecondary">
          Vehicles you can drive for shared rides.
        </ThemedText>
      </View>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Add vehicle"
        onPress={onAdd}
        style={[styles.addButton, { backgroundColor: theme.primary }]}>
        <SymbolView name={Icons.add} size={20} tintColor={theme.onPrimary} />
      </Pressable>
    </View>
  );
}

function VehicleEmptyState({ onAdd }: { onAdd: () => void }) {
  return (
    <StateMessage
      icon="car"
      title="No vehicle added yet"
      message="Add your car so coworkers can join your shared rides."
      action={{ label: 'Add vehicle', onPress: onAdd }}
    />
  );
}

function NoticeBlock({ title, body }: { title: string; body: string }) {
  return <StateMessage icon="car" tone="neutral" title={title} message={body} />;
}

function VehicleListSkeleton() {
  return (
    <>
      <Skeleton width={160} height={32} />
      <Skeleton height={128} radius={Spacing.three} />
      <Skeleton height={128} radius={Spacing.three} />
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
  title: {
    fontSize: 32,
    lineHeight: 38,
  },
  listHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: Spacing.three,
  },
  listHeaderText: {
    flex: 1,
    gap: Spacing.one,
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadErrorGroup: {
    gap: Spacing.three,
  },
});
