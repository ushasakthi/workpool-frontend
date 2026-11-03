import { Image, type ImageSource } from 'expo-image';
import { SymbolView } from 'expo-symbols';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Icons } from '@/constants/icons';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

const SIZE = 96;

interface ProfilePhotoProps {
  photo?: ImageSource;
  editable?: boolean;
  onChangePress?: () => void;
}

export function ProfilePhoto({ photo, editable = false, onChangePress }: ProfilePhotoProps) {
  const theme = useTheme();
  const hasPhoto = Boolean(photo?.uri);

  const avatar = (
    <View style={styles.avatarBox}>
      <View
        style={[
          styles.circle,
          {
            borderColor: theme.border,
            backgroundColor: theme.backgroundElement,
            borderStyle: hasPhoto ? 'solid' : 'dashed',
          },
        ]}>
        {hasPhoto ? (
          <Image source={photo} style={styles.image} contentFit="cover" />
        ) : (
          <ThemedText type="small" themeColor="textSecondary">
            Photo
          </ThemedText>
        )}
      </View>
      {editable && (
        <View style={[styles.badge, { backgroundColor: theme.primary, borderColor: theme.background }]}>
          <SymbolView name={Icons.pencil} size={13} tintColor={theme.onPrimary} />
        </View>
      )}
    </View>
  );

  return (
    <View style={styles.wrap}>
      {editable ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Change profile photo"
          onPress={onChangePress}>
          {avatar}
        </Pressable>
      ) : (
        avatar
      )}
      {editable && (
        <Pressable accessibilityRole="button" onPress={onChangePress} hitSlop={8}>
          <ThemedText type="smallBold" themeColor="primary">
            Change photo
          </ThemedText>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    gap: Spacing.two,
  },
  avatarBox: {
    width: SIZE,
    height: SIZE,
  },
  circle: {
    width: SIZE,
    height: SIZE,
    borderRadius: SIZE / 2,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  badge: {
    position: 'absolute',
    right: -2,
    bottom: -2,
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
