import { Image, type ImageSource } from 'expo-image';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { useTheme } from '@/hooks/use-theme';

const AVATAR_SIZE = 44;

interface GreetingHeaderProps {
  greeting: string;
  name: string;
  photo?: ImageSource;
  onAvatarPress: () => void;
}

export function GreetingHeader({ greeting, name, photo, onAvatarPress }: GreetingHeaderProps) {
  const theme = useTheme();

  return (
    <View style={styles.row}>
      <View style={styles.text}>
        <ThemedText themeColor="textSecondary">{greeting}</ThemedText>
        <ThemedText style={styles.name} numberOfLines={1}>
          {name}
        </ThemedText>
      </View>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Open profile"
        onPress={onAvatarPress}
        style={[styles.avatar, { backgroundColor: theme.primarySoft }]}>
        {photo?.uri ? (
          <Image source={photo} style={styles.image} contentFit="cover" />
        ) : (
          <ThemedText type="smallBold" themeColor="primarySoftText" style={styles.initial}>
            {name.charAt(0).toUpperCase()}
          </ThemedText>
        )}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  text: {
    flex: 1,
  },
  name: {
    fontSize: 32,
    lineHeight: 38,
    fontWeight: 700,
  },
  avatar: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  initial: {
    fontSize: 17,
  },
});
