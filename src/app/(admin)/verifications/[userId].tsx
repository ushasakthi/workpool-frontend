import { Image } from 'expo-image';
import { type ExternalPathString, useLocalSearchParams, useRouter } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Modal, Platform, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';

import { getVerificationSubmission, reviewVerification } from '@/api/admin.api';
import { apiClient, apiUrl, AUTH_TOKEN_STORAGE_KEY, readSecureItem } from '@/api/client';
import { StatusBadge, statusBadgeTone } from '@/components/admin/status-badge';
import { ExternalLink } from '@/components/external-link';
import { ThemedText } from '@/components/themed-text';
import { Banner } from '@/components/ui/banner';
import { Button } from '@/components/ui/button';
import { Icons } from '@/constants/icons';
import { Spacing } from '@/constants/theme';
import { VerificationStatus } from '@/constants/verification-status.enum';
import { useTheme } from '@/hooks/use-theme';
import type { VerificationSubmission } from '@/types/user.types';
import { getErrorMessage } from '@/utils/errors';
import { formatDate } from '@/utils/formatters';
import { getOverallVerificationStatus } from '@/utils/verification';

interface ImageSource {
  uri: string;
  headers: Record<string, string>;
}

export default function VerificationDetailScreen() {
  const { userId } = useLocalSearchParams<{ userId: string }>();
  const router = useRouter();
  const theme = useTheme();

  const [submission, setSubmission] = useState<VerificationSubmission | null>(null);
  const [imageSource, setImageSource] = useState<ImageSource | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isReviewing, setIsReviewing] = useState(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const [data, token] = await Promise.all([
          getVerificationSubmission(userId),
          readSecureItem(AUTH_TOKEN_STORAGE_KEY),
        ]);
        if (cancelled) return;
        setSubmission(data);
        if (data.nicDocumentUrl && token) {
          setImageSource({
            uri: `${apiUrl}/users/${data.id}/nic-document`,
            headers: { Authorization: `Bearer ${token}` },
          });
        }
      } catch (err) {
        if (!cancelled) setError(getErrorMessage(err));
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [userId]);

  async function handleApprove() {
    if (!submission) return;
    setError(null);
    setIsReviewing(true);
    try {
      await reviewVerification(submission.id, VerificationStatus.VERIFIED);
      router.back();
    } catch (err) {
      setError(getErrorMessage(err));
      setIsReviewing(false);
    }
  }

  async function handleConfirmReject() {
    if (!submission || !rejectionReason.trim()) return;
    setError(null);
    setIsReviewing(true);
    try {
      await reviewVerification(submission.id, VerificationStatus.REJECTED, rejectionReason.trim());
      setIsRejectModalOpen(false);
      router.back();
    } catch (err) {
      setError(getErrorMessage(err));
      setIsReviewing(false);
    }
  }

  async function handleOpenPdf() {
    if (!submission || Platform.OS !== 'web') return;
    const response = await apiClient.get<Blob>(`/users/${submission.id}/nic-document`, {
      responseType: 'blob',
    });
    const blobUrl = URL.createObjectURL(response.data);
    window.open(blobUrl, '_blank');
  }

  if (!submission) {
    return (
      <View style={styles.loadingContainer}>
        {error ? <Banner message={error} /> : <ActivityIndicator color={theme.primary} />}
      </View>
    );
  }

  const status = getOverallVerificationStatus(
    submission.verification.identityStatus,
    submission.verification.workplaceStatus,
  );
  const statusLabel = status.charAt(0).toUpperCase() + status.slice(1);
  const isPdf = submission.nicDocumentUrl?.toLowerCase().endsWith('.pdf') ?? false;
  const isDecided = status !== VerificationStatus.PENDING;

  return (
    <View style={styles.flex}>
      <View style={[styles.breadcrumbBar, { borderBottomColor: theme.border }]}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Back to verification queue"
          onPress={() => router.back()}
          style={[styles.backButton, { borderColor: theme.border }]}>
          <SymbolView name={Icons.back} size={16} tintColor={theme.text} />
        </Pressable>
        <View style={styles.breadcrumbText}>
          <Pressable onPress={() => router.back()}>
            <ThemedText type="small" themeColor="textSecondary">
              Verification queue
            </ThemedText>
          </Pressable>
          <ThemedText type="smallBold" style={styles.applicantName}>
            {submission.name}
          </ThemedText>
        </View>
        <StatusBadge label={statusLabel} tone={statusBadgeTone(status)} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {error && <Banner message={error} />}

        <View style={styles.columns}>
          <View style={styles.docColumn}>
            <ThemedText type="smallBold">NIC document</ThemedText>
            {isPdf ? (
              <View style={[styles.docPlaceholder, { backgroundColor: theme.backgroundElement }]}>
                <ThemedText themeColor="textSecondary" style={styles.centerText}>
                  This submission is a PDF document.
                </ThemedText>
                {Platform.OS === 'web' ? (
                  <Button label="Open PDF" variant="soft" onPress={handleOpenPdf} />
                ) : (
                  <ThemedText type="small" themeColor="textSecondary" style={styles.centerText}>
                    Open this review on the web admin console to view PDF documents.
                  </ThemedText>
                )}
              </View>
            ) : imageSource ? (
              <Image source={imageSource} style={styles.image} contentFit="contain" />
            ) : (
              <View style={[styles.docPlaceholder, { backgroundColor: theme.backgroundElement }]}>
                <ActivityIndicator color={theme.primary} />
              </View>
            )}
          </View>

          <View style={styles.infoColumn}>
            <View style={styles.infoSection}>
              <ThemedText type="small" themeColor="textSecondary" style={styles.sectionLabel}>
                APPLICANT
              </ThemedText>
              <InfoRow label="Full name" value={submission.name} />
              <InfoRow label="Work email" value={submission.email} />
              <InfoRow
                label="Submitted"
                value={
                  submission.verification.submittedAt ? formatDate(submission.verification.submittedAt) : '—'
                }
              />
            </View>

            {submission.linkedinUrl && (
              <View style={styles.infoSection}>
                <ThemedText type="small" themeColor="textSecondary" style={styles.sectionLabel}>
                  LINKEDIN
                </ThemedText>
                <ExternalLink href={submission.linkedinUrl as ExternalPathString}>
                  <View style={[styles.linkedinCard, { backgroundColor: theme.backgroundElement }]}>
                    <ThemedText
                      type="smallBold"
                      themeColor="primary"
                      numberOfLines={1}
                      style={styles.linkedinText}>
                      {submission.linkedinUrl}
                    </ThemedText>
                  </View>
                </ExternalLink>
              </View>
            )}

            {isDecided && submission.verification.rejectionReason && (
              <Banner message={`Rejected: ${submission.verification.rejectionReason}`} />
            )}

            {!isDecided && (
              <View style={styles.actionsRow}>
                <View style={styles.actionButton}>
                  <Button
                    label="Reject"
                    variant="danger"
                    onPress={() => setIsRejectModalOpen(true)}
                    disabled={isReviewing}
                  />
                </View>
                <View style={styles.actionButton}>
                  <Button label="Approve" onPress={handleApprove} loading={isReviewing} />
                </View>
              </View>
            )}
          </View>
        </View>
      </ScrollView>

      <Modal
        transparent
        animationType="fade"
        visible={isRejectModalOpen}
        onRequestClose={() => setIsRejectModalOpen(false)}>
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalCard, { backgroundColor: theme.background }]}>
            <ThemedText type="smallBold">Reason for rejection</ThemedText>
            <TextInput
              value={rejectionReason}
              onChangeText={setRejectionReason}
              placeholder="e.g. NIC photo is blurry"
              placeholderTextColor={theme.placeholder}
              multiline
              style={[styles.reasonInput, { backgroundColor: theme.backgroundElement, color: theme.text }]}
            />
            <View style={styles.modalActions}>
              <Button
                label="Cancel"
                variant="text"
                onPress={() => setIsRejectModalOpen(false)}
                disabled={isReviewing}
              />
              <Button
                label="Confirm reject"
                variant="danger"
                onPress={handleConfirmReject}
                disabled={!rejectionReason.trim()}
                loading={isReviewing}
              />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <ThemedText themeColor="textSecondary">{label}</ThemedText>
      <ThemedText type="smallBold">{value}</ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.four,
  },
  breadcrumbBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.three,
    borderBottomWidth: 1,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: Spacing.two,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  breadcrumbText: {
    flex: 1,
  },
  applicantName: {
    fontSize: 18,
  },
  content: {
    padding: Spacing.four,
  },
  columns: {
    flexDirection: 'row',
    gap: Spacing.five,
  },
  docColumn: {
    flex: 1.4,
    gap: Spacing.two,
  },
  docPlaceholder: {
    aspectRatio: 4 / 3,
    borderRadius: Spacing.three,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.three,
    padding: Spacing.four,
  },
  centerText: {
    textAlign: 'center',
  },
  image: {
    width: '100%',
    aspectRatio: 4 / 3,
    borderRadius: Spacing.three,
  },
  infoColumn: {
    flex: 1,
    gap: Spacing.five,
  },
  infoSection: {
    gap: Spacing.two,
  },
  sectionLabel: {
    letterSpacing: 0.4,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: Spacing.two,
  },
  linkedinCard: {
    borderRadius: Spacing.three,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.three,
  },
  linkedinText: {
    textDecorationLine: 'underline',
  },
  actionsRow: {
    flexDirection: 'row',
    gap: Spacing.three,
  },
  actionButton: {
    flex: 1,
  },
  modalBackdrop: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.4)',
    padding: Spacing.four,
  },
  modalCard: {
    width: '100%',
    maxWidth: 420,
    borderRadius: Spacing.four,
    padding: Spacing.four,
    gap: Spacing.three,
  },
  reasonInput: {
    borderRadius: Spacing.three,
    padding: Spacing.three,
    minHeight: 88,
    textAlignVertical: 'top',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: Spacing.two,
  },
});
