import { Image, type ImageSource } from 'expo-image';
import { SymbolView } from 'expo-symbols';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Icons } from '@/constants/icons';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

interface VehiclePhotoFieldProps {
  label: string;
  source?: ImageSource;
  onPick: () => void;
  error?: string;
}

export function VehiclePhotoField({
  label,
  source,
  onPick,
  error,
}: VehiclePhotoFieldProps) {
  const theme = useTheme();
  const hasPhoto = Boolean(source?.uri);

  return (
    <View style={styles.container}>
      <ThemedText type="smallBold">{label}</ThemedText>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={
          hasPhoto ? 'Change vehicle photo' : 'Add a photo of your car'
        }
        onPress={onPick}
        style={[
          styles.dropzone,
          {
            borderColor: error ? theme.error : theme.border,
            backgroundColor: theme.backgroundElement,
          },
        ]}>
        {hasPhoto ? (
          <>
            <Image source={source} style={styles.image} contentFit="cover" />
            <View
              style={[styles.changePill, { backgroundColor: theme.background }]}>
              <SymbolView
                name={Icons.camera}
                size={13}
                tintColor={theme.text}
              />
              <ThemedText type="small">Change photo</ThemedText>
            </View>
          </>
        ) : (
          <>
            <SymbolView
              name={Icons.image}
              size={28}
              tintColor={theme.textSecondary}
            />
            <ThemedText type="smallBold">Add a photo of your car</ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              or{' '}
              <ThemedText type="small" themeColor="textSecondary" style={styles.underline}>
                browse files
              </ThemedText>
            </ThemedText>
          </>
        )}
      </Pressable>
      {error && (
        <ThemedText type="small" themeColor="error">
          {error}
        </ThemedText>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.two,
  },
  dropzone: {
    height: 140,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderRadius: Spacing.three,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.one,
    overflow: 'hidden',
  },
  image: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  changePill: {
    position: 'absolute',
    right: Spacing.two,
    bottom: Spacing.two,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.half,
    borderRadius: Spacing.five,
  },
  underline: {
    textDecorationLine: 'underline',
  },
});
