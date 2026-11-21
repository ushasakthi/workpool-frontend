import { SymbolView } from 'expo-symbols';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Icons } from '@/constants/icons';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

interface UploadDropzoneProps {
  fileName?: string;
  uploadProgress?: number;
  error?: string;
  onPress: () => void;
}

export function UploadDropzone({ fileName, uploadProgress, error, onPress }: UploadDropzoneProps) {
  const theme = useTheme();
  const isUploading = uploadProgress !== undefined && uploadProgress < 100;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={fileName ? `Replace uploaded file ${fileName}` : 'Upload NIC photo or PDF'}
      onPress={onPress}
      style={[
        styles.dropzone,
        { borderColor: error ? theme.error : theme.border, backgroundColor: theme.backgroundElement },
      ]}>
      <SymbolView name={Icons.cloudUpload} size={28} tintColor={error ? theme.error : theme.textSecondary} />
      <ThemedText type="smallBold" style={styles.title}>
        {fileName ?? 'Upload NIC photo or PDF'}
      </ThemedText>
      {!fileName && (
        <ThemedText type="small" themeColor="textSecondary">
          JPG, PNG or PDF, up to 5MB
        </ThemedText>
      )}
      {isUploading && (
        <View style={[styles.progressTrack, { backgroundColor: theme.border }]}>
          <View
            style={[styles.progressFill, { width: `${uploadProgress}%`, backgroundColor: theme.primary }]}
          />
        </View>
      )}
      {error && (
        <ThemedText type="small" themeColor="error">
          {error}
        </ThemedText>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  dropzone: {
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderRadius: Spacing.three,
    paddingVertical: Spacing.five,
    paddingHorizontal: Spacing.three,
    alignItems: 'center',
    gap: Spacing.one,
  },
  title: {
    textAlign: 'center',
  },
  progressTrack: {
    width: '100%',
    height: 4,
    borderRadius: 2,
    marginTop: Spacing.two,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
  },
});
