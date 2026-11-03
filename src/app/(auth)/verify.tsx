import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { useState } from 'react';
import { Alert, Modal, Pressable, StyleSheet, View } from 'react-native';

import { submitVerification } from '@/api/users.api';
import { ThemedText } from '@/components/themed-text';
import { Banner } from '@/components/ui/banner';
import { Button } from '@/components/ui/button';
import { OnboardingFooter } from '@/components/ui/onboarding-footer';
import { OnboardingHeader } from '@/components/ui/onboarding-header';
import { Screen } from '@/components/ui/screen';
import { StatusPill } from '@/components/ui/status-pill';
import { TextField } from '@/components/ui/text-field';
import { UploadDropzone } from '@/components/ui/upload-dropzone';
import { Icons } from '@/constants/icons';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useAuthStore } from '@/stores/useAuthStore';
import { getErrorMessage } from '@/utils/errors';

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'application/pdf'];
const NIC_REGEX = /^([0-9]{9}[vVxX]|[0-9]{12})$/;
const LINKEDIN_URL_REGEX = /^https?:\/\/([\w-]+\.)?linkedin\.com\/.+/i;

interface PickedFile {
  uri: string;
  name: string;
  mimeType: string;
}

interface PickedFileCandidate {
  uri: string;
  name: string;
  mimeType: string;
  size?: number | null;
}

function normalizeLinkedinUrl(value: string): string {
  const trimmed = value.trim();
  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
}

export default function VerifyScreen() {
  const theme = useTheme();
  const router = useRouter();
  const clearSession = useAuthStore((state) => state.clearSession);

  const [nicNumber, setNicNumber] = useState('');
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [file, setFile] = useState<PickedFile | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [isPickerMenuOpen, setIsPickerMenuOpen] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | undefined>(undefined);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const normalizedLinkedinUrl = normalizeLinkedinUrl(linkedinUrl);
  const nicValid = NIC_REGEX.test(nicNumber.trim());
  const linkedinValid = LINKEDIN_URL_REGEX.test(normalizedLinkedinUrl);
  const canSubmit = nicValid && linkedinValid && file !== null && !isSubmitting;

  // don't show errors until the user types or submits
  const nicError =
    (submitAttempted || nicNumber.trim().length > 0) && !nicValid
      ? 'Enter a valid Sri Lankan NIC: 12 digits (e.g. 200012345678) or 9 digits + V (e.g. 912345678V).'
      : undefined;
  const linkedinError =
    (submitAttempted || linkedinUrl.trim().length > 0) && !linkedinValid
      ? 'Enter your full LinkedIn profile URL, e.g. linkedin.com/in/yourname'
      : undefined;

  const missing: string[] = [];
  if (!file) missing.push('your NIC photo or PDF');
  if (!nicValid) missing.push('a valid NIC number');
  if (!linkedinValid) missing.push('your LinkedIn profile URL');

  function processPickedFile(candidate: PickedFileCandidate) {
    if (!ALLOWED_MIME_TYPES.includes(candidate.mimeType)) {
      setFileError('File must be a JPG, PNG, or PDF.');
      return;
    }
    if (candidate.size && candidate.size > MAX_FILE_SIZE_BYTES) {
      setFileError('File must be 5MB or smaller.');
      return;
    }

    setFile({ uri: candidate.uri, name: candidate.name, mimeType: candidate.mimeType });
  }

  async function handlePickFromPhotos() {
    setIsPickerMenuOpen(false);
    setFileError(null);

    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      setFileError('Photo library access is required to choose a photo.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.8 });
    if (result.canceled) return;

    const asset = result.assets[0];
    processPickedFile({
      uri: asset.uri,
      name: asset.fileName ?? `nic-${Date.now()}.jpg`,
      mimeType: asset.mimeType ?? 'image/jpeg',
      size: asset.fileSize,
    });
  }

  async function handlePickDocument() {
    setIsPickerMenuOpen(false);
    setFileError(null);

    const result = await DocumentPicker.getDocumentAsync({
      type: ALLOWED_MIME_TYPES,
      copyToCacheDirectory: true,
    });
    if (result.canceled) return;

    const asset = result.assets[0];
    processPickedFile({
      uri: asset.uri,
      name: asset.name,
      mimeType: asset.mimeType ?? 'application/octet-stream',
      size: asset.size,
    });
  }

  function showNicInfo() {
    Alert.alert(
      'Why we need this',
      'A clear photo or PDF of your National Identity Card lets our team confirm you’re a real, verified professional before you can post or join rides.',
    );
  }

  async function handleSubmit() {
    if (!canSubmit) {
      setSubmitAttempted(true);
      return;
    }
    if (!file) return;

    setError(null);
    setIsSubmitting(true);
    setUploadProgress(0);
    try {
      await submitVerification({
        nicNumber: nicNumber.trim(),
        linkedinUrl: normalizedLinkedinUrl,
        file,
        onUploadProgress: setUploadProgress,
      });
      // log out so the user has to log in again to check status
      await clearSession();
      router.replace('/login?justSubmitted=1');
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsSubmitting(false);
      setUploadProgress(undefined);
    }
  }

  return (
    <Screen header={<OnboardingHeader />}>
      <StatusPill label="STEP 1 OF 2" />

      <View style={styles.headingGroup}>
        <ThemedText type="title" style={styles.title}>
          Verify your identity
        </ThemedText>
        <ThemedText themeColor="textSecondary">Required once, reviewed by our team.</ThemedText>
      </View>

      {error && <Banner message={error} />}

      <View style={styles.fieldGroup}>
        <View style={styles.labelRow}>
          <ThemedText type="smallBold">NIC (front side)</ThemedText>
          <Pressable
            onPress={showNicInfo}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="Why we need this">
            <SymbolView name={Icons.infoCircle} size={16} tintColor={theme.textSecondary} />
          </Pressable>
        </View>
        <UploadDropzone
          fileName={file?.name}
          uploadProgress={uploadProgress}
          error={
            fileError ??
            (submitAttempted && !file ? 'Upload your NIC to continue.' : undefined)
          }
          onPress={() => setIsPickerMenuOpen(true)}
        />
      </View>

      <Modal
        transparent
        animationType="fade"
        visible={isPickerMenuOpen}
        onRequestClose={() => setIsPickerMenuOpen(false)}>
        <Pressable style={styles.menuBackdrop} onPress={() => setIsPickerMenuOpen(false)}>
          <View style={[styles.menuCard, { backgroundColor: theme.background }]}>
            <Pressable style={styles.menuOption} onPress={handlePickFromPhotos}>
              <ThemedText type="smallBold">Choose from Photos</ThemedText>
            </Pressable>
            <View style={[styles.menuDivider, { backgroundColor: theme.border }]} />
            <Pressable style={styles.menuOption} onPress={handlePickDocument}>
              <ThemedText type="smallBold">Choose a File (PDF)</ThemedText>
            </Pressable>
            <View style={[styles.menuDivider, { backgroundColor: theme.border }]} />
            <Pressable style={styles.menuOption} onPress={() => setIsPickerMenuOpen(false)}>
              <ThemedText type="smallBold" themeColor="error">
                Cancel
              </ThemedText>
            </Pressable>
          </View>
        </Pressable>
      </Modal>

      <TextField
        label="NIC number"
        placeholder="199912345678 or 912345678V"
        value={nicNumber}
        onChangeText={setNicNumber}
        autoCapitalize="characters"
        error={nicError}
        helperText="12 digits, or 9 digits followed by V"
      />

      <TextField
        label="LinkedIn profile"
        placeholder="linkedin.com/in/yourname"
        value={linkedinUrl}
        onChangeText={setLinkedinUrl}
        autoCapitalize="none"
        autoCorrect={false}
        keyboardType="url"
        error={linkedinError}
        helperText="A public link to your LinkedIn profile"
      />

      <View style={styles.submitGroup}>
        <Button label="Submit for review" onPress={handleSubmit} loading={isSubmitting} />
        <ThemedText type="small" themeColor="textSecondary" style={styles.footerHint}>
          {canSubmit
            ? "You'll be notified once your account is verified."
            : `Still needed: ${missing.join(', ')}.`}
        </ThemedText>
      </View>

      <OnboardingFooter />
    </Screen>
  );
}

const styles = StyleSheet.create({
  headingGroup: {
    gap: Spacing.one,
  },
  title: {
    fontSize: 28,
    lineHeight: 34,
  },
  fieldGroup: {
    gap: Spacing.two,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
  },
  submitGroup: {
    gap: Spacing.two,
    alignItems: 'center',
  },
  footerHint: {
    textAlign: 'center',
  },
  menuBackdrop: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  menuCard: {
    borderTopLeftRadius: Spacing.four,
    borderTopRightRadius: Spacing.four,
    paddingBottom: Spacing.five,
    paddingTop: Spacing.two,
  },
  menuOption: {
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.four,
    alignItems: 'center',
  },
  menuDivider: {
    height: 1,
  },
});
