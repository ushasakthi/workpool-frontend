import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import type { ImageSource } from 'expo-image';

import type { ProfilePhotoFile } from '@/api/users.api';
import { RoleChoice } from '@/components/auth/role-choice';
import { ProfilePhoto } from '@/components/profile/profile-photo';
import { VerificationStatusCard } from '@/components/profile/verification-status-card';
import { ThemedText } from '@/components/themed-text';
import { Banner } from '@/components/ui/banner';
import { Button } from '@/components/ui/button';
import { Screen } from '@/components/ui/screen';
import { Skeleton } from '@/components/ui/skeleton';
import { TextField } from '@/components/ui/text-field';
import { Icons } from '@/constants/icons';
import { Spacing } from '@/constants/theme';
import { UserRole } from '@/constants/user-role.enum';
import { useApiImageSource } from '@/hooks/use-api-image';
import { useTheme } from '@/hooks/use-theme';
import { useAuthStore } from '@/stores/useAuthStore';
import type { UserProfile } from '@/types/user.types';
import { getErrorMessage } from '@/utils/errors';

const PHONE_MIN_DIGITS = 7;
const MAX_PHOTO_BYTES = 5 * 1024 * 1024;
const ALLOWED_PHOTO_MIME = ['image/jpeg', 'image/png', 'image/webp'];

export default function ProfileScreen() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const refreshMe = useAuthStore((state) => state.refreshMe);
  const photo = useApiImageSource(user?.photoUrl);

  const [loadError, setLoadError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    void refreshMe().catch((err) => setLoadError(getErrorMessage(err)));
  }, [refreshMe]);

  if (!user) {
    return (
      <Screen header={<HeaderRow title="Profile" />} underTabBar>
        {loadError ? (
          <View style={styles.loadErrorGroup}>
            <Banner message={loadError} />
            <Button
              label="Try again"
              variant="soft"
              onPress={() => {
                setLoadError(null);
                void refreshMe().catch((err) => setLoadError(getErrorMessage(err)));
              }}
            />
          </View>
        ) : (
          <ProfileSkeleton />
        )}
      </Screen>
    );
  }

  if (isEditing) {
    return <EditProfile user={user} onDone={() => setIsEditing(false)} />;
  }

  return (
    <Screen
      underTabBar
      header={
        <HeaderRow
          title="Profile"
          action={{ label: 'Edit', onPress: () => setIsEditing(true) }}
        />
      }>
      <View style={styles.photoBlock}>
        <ProfilePhoto photo={photo} />
        <ThemedText type="smallBold" style={styles.nameHeading}>
          {user.name}
        </ThemedText>
      </View>

      <ReadOnlyField label="NAME" value={user.name} />
      <ReadOnlyField label="PHONE" value={user.phone} />

      <View style={styles.section}>
        <ThemedText type="smallBold" themeColor="textSecondary" style={styles.sectionLabel}>
          VERIFICATION STATUS
        </ThemedText>
        <VerificationStatusCard verification={user.verification} />
      </View>

      <NavLink
        icon="emergency"
        title="Emergency contact"
        subtitle={user.emergencyContact?.name ?? 'Not set'}
        onPress={() => router.push('/profile/emergency-contact')}
      />

      <LogoutButton />
    </Screen>
  );
}

function LogoutButton() {
  const theme = useTheme();
  const clearSession = useAuthStore((state) => state.clearSession);
  const [confirming, setConfirming] = useState(false);

  if (confirming) {
    return (
      <View style={[styles.logoutConfirm, { borderColor: theme.border }]}>
        <ThemedText type="smallBold" style={styles.logoutConfirmText}>
          Log out of WorkPool?
        </ThemedText>
        <View style={styles.logoutConfirmActions}>
          <Pressable
            accessibilityRole="button"
            onPress={() => setConfirming(false)}
            hitSlop={8}>
            <ThemedText type="smallBold" themeColor="textSecondary">
              Cancel
            </ThemedText>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            onPress={() => void clearSession()}
            hitSlop={8}>
            <ThemedText type="smallBold" themeColor="error">
              Log out
            </ThemedText>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Log out"
      onPress={() => setConfirming(true)}
      style={[styles.logoutRow, { borderColor: theme.border }]}>
      <SymbolView name={Icons.logout} size={18} tintColor={theme.error} />
      <ThemedText type="smallBold" themeColor="error">
        Log out
      </ThemedText>
    </Pressable>
  );
}

function EditProfile({ user, onDone }: { user: UserProfile; onDone: () => void }) {
  const theme = useTheme();
  const updateProfile = useAuthStore((state) => state.updateProfile);
  const uploadProfilePhoto = useAuthStore((state) => state.uploadProfilePhoto);
  const serverPhoto = useApiImageSource(user.photoUrl);

  const [name, setName] = useState(user.name);
  const [phone, setPhone] = useState(user.phone);
  const [role, setRole] = useState<UserRole>(user.role);
  const [pickedPhoto, setPickedPhoto] = useState<ProfilePhotoFile | null>(null);
  const [pickedSource, setPickedSource] = useState<ImageSource | undefined>(undefined);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [roleNotice, setRoleNotice] = useState(false);

  const becomesProvider =
    user.role === UserRole.PASSENGER &&
    (role === UserRole.DRIVER || role === UserRole.BOTH);

  const photoSource = pickedSource ?? serverPhoto;

  const phoneDigits = phone.replace(/\D/g, '');
  const trimmedName = name.trim();
  const isValid = trimmedName.length > 0 && phoneDigits.length >= PHONE_MIN_DIGITS;

  async function handlePickPhoto() {
    setPhotoError(null);
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      setPhotoError('Photo library access is required to choose a photo.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.8,
    });
    if (result.canceled) return;

    const asset = result.assets[0];
    const mimeType = asset.mimeType ?? 'image/jpeg';
    if (!ALLOWED_PHOTO_MIME.includes(mimeType)) {
      setPhotoError('Photo must be a JPG, PNG, or WebP image.');
      return;
    }
    if (asset.fileSize && asset.fileSize > MAX_PHOTO_BYTES) {
      setPhotoError('Photo must be 5MB or smaller.');
      return;
    }
    setPickedPhoto({
      uri: asset.uri,
      name: asset.fileName ?? `photo-${Date.now()}.jpg`,
      mimeType,
    });
    setPickedSource({ uri: asset.uri });
  }

  async function handleSave() {
    if (!isValid) return;
    setSaveError(null);
    setIsSaving(true);
    try {
      if (pickedPhoto) {
        await uploadProfilePhoto(pickedPhoto);
        setPickedPhoto(null);
      }
      await updateProfile({ name: trimmedName, phone: phone.trim(), role });
      // new drivers need a fresh token before they can post rides
      if (becomesProvider) {
        setRoleNotice(true);
      } else {
        onDone();
      }
    } catch (err) {
      setSaveError(getErrorMessage(err));
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <Screen
      underTabBar
      header={
        <HeaderRow
          title="Edit profile"
          action={{ label: 'Cancel', onPress: onDone, disabled: isSaving }}
        />
      }>
      {saveError && <Banner message={saveError} />}
      {photoError && <Banner message={photoError} />}
      {roleNotice && (
        <Banner
          tone="success"
          icon="checkCircle"
          message="Role updated. Log out and back in before you post a ride or add a vehicle."
        />
      )}

      <View style={styles.photoBlock}>
        <ProfilePhoto photo={photoSource} editable onChangePress={handlePickPhoto} />
        <ThemedText type="small" themeColor="textSecondary" style={styles.photoNote}>
          JPG, PNG or WebP · up to 5MB
        </ThemedText>
      </View>

      <TextField label="Name" placeholder="Your name" value={name} onChangeText={setName} />

      <TextField
        label="Phone"
        placeholder="(415) 555-0148"
        value={phone}
        onChangeText={setPhone}
        keyboardType="phone-pad"
        textContentType="telephoneNumber"
        helperText="Used only for ride coordination"
      />

      {user.role !== UserRole.ADMIN && (
        <View style={styles.section}>
          <ThemedText type="smallBold" themeColor="textSecondary" style={styles.sectionLabel}>
            I WANT TO
          </ThemedText>
          <RoleChoice value={role} onChange={setRole} />
          <ThemedText type="small" themeColor="textSecondary">
            &quot;Offer rides&quot; lets you add a vehicle and post rides.
          </ThemedText>
        </View>
      )}

      <View style={[styles.infoNote, { borderColor: theme.border }]}>
        <SymbolView name={Icons.infoCircle} size={16} tintColor={theme.textSecondary} />
        <ThemedText type="small" themeColor="textSecondary" style={styles.infoNoteText}>
          Identity and workplace verification aren&apos;t edited here — see Verification in Settings.
        </ThemedText>
      </View>

      {roleNotice ? (
        <Button label="Done" onPress={onDone} />
      ) : (
        <Button
          label={saveError ? 'Try again' : 'Save changes'}
          onPress={handleSave}
          disabled={!isValid}
          loading={isSaving}
        />
      )}
    </Screen>
  );
}

function HeaderRow({
  title,
  action,
}: {
  title: string;
  action?: { label: string; onPress: () => void; disabled?: boolean };
}) {
  return (
    <View style={styles.headerRow}>
      <ThemedText type="title" style={styles.headerTitle}>
        {title}
      </ThemedText>
      {action && (
        <Pressable
          accessibilityRole="button"
          onPress={action.disabled ? undefined : action.onPress}
          hitSlop={8}>
          <ThemedText type="smallBold" themeColor="primary" style={action.disabled && styles.disabled}>
            {action.label}
          </ThemedText>
        </Pressable>
      )}
    </View>
  );
}

function ReadOnlyField({ label, value }: { label: string; value: string }) {
  const theme = useTheme();
  return (
    <View style={styles.section}>
      <ThemedText type="smallBold" themeColor="textSecondary" style={styles.sectionLabel}>
        {label}
      </ThemedText>
      <View style={[styles.readOnlyBox, { backgroundColor: theme.backgroundElement }]}>
        <ThemedText>{value}</ThemedText>
      </View>
    </View>
  );
}

function NavLink({
  icon,
  title,
  subtitle,
  onPress,
}: {
  icon: keyof typeof Icons;
  title: string;
  subtitle: string;
  onPress: () => void;
}) {
  const theme = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={title}
      onPress={onPress}
      style={[styles.linkRow, { borderColor: theme.border }]}>
      <View style={styles.linkRowLeft}>
        <SymbolView name={Icons[icon]} size={20} tintColor={theme.textSecondary} />
        <View>
          <ThemedText type="smallBold">{title}</ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            {subtitle}
          </ThemedText>
        </View>
      </View>
      <SymbolView name={Icons.arrowRight} size={16} tintColor={theme.textSecondary} />
    </Pressable>
  );
}

function ProfileSkeleton() {
  return (
    <>
      <View style={styles.photoBlock}>
        <Skeleton circle height={96} />
        <Skeleton width={140} height={18} />
      </View>
      <View style={styles.section}>
        <Skeleton width={64} height={12} />
        <Skeleton height={48} />
      </View>
      <View style={styles.section}>
        <Skeleton width={64} height={12} />
        <Skeleton height={48} />
      </View>
      <View style={styles.section}>
        <Skeleton width={140} height={12} />
        <Skeleton height={104} radius={Spacing.three} />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: {
    fontSize: 32,
    lineHeight: 38,
  },
  disabled: {
    opacity: 0.5,
  },
  photoBlock: {
    alignItems: 'center',
    gap: Spacing.two,
  },
  nameHeading: {
    fontSize: 18,
  },
  photoNote: {
    textAlign: 'center',
  },
  section: {
    gap: Spacing.two,
  },
  sectionLabel: {
    letterSpacing: 0.4,
  },
  readOnlyBox: {
    borderRadius: Spacing.three,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.three,
  },
  infoNote: {
    flexDirection: 'row',
    gap: Spacing.two,
    borderWidth: 1,
    borderRadius: Spacing.three,
    padding: Spacing.three,
  },
  infoNoteText: {
    flex: 1,
  },
  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderRadius: Spacing.three,
    padding: Spacing.three,
  },
  linkRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  loadErrorGroup: {
    gap: Spacing.three,
  },
  logoutRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.two,
    borderWidth: 1,
    borderRadius: Spacing.three,
    padding: Spacing.three,
  },
  logoutConfirm: {
    borderWidth: 1,
    borderRadius: Spacing.three,
    padding: Spacing.three,
    gap: Spacing.three,
    alignItems: 'center',
  },
  logoutConfirmText: {
    fontSize: 16,
  },
  logoutConfirmActions: {
    flexDirection: 'row',
    gap: Spacing.five,
  },
});
