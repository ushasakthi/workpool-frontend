import { useRouter, type Href } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { UserRole } from '@/constants/user-role.enum';
import { useTheme } from '@/hooks/use-theme';
import { useAuthStore } from '@/stores/useAuthStore';

type SegmentKey = 'search' | 'my-rides' | 'post';

interface RidesSegmentProps {
  active: SegmentKey;
}

// "Find a ride" is only for users who also travel as passengers
const SEGMENTS: { key: SegmentKey; label: string; href: Href; roles: UserRole[] }[] = [
  { key: 'search', label: 'Find a ride', href: '/rides/search', roles: [UserRole.BOTH] },
  { key: 'my-rides', label: 'My rides', href: '/rides/my-rides', roles: [UserRole.DRIVER, UserRole.BOTH] },
  { key: 'post', label: 'Post a ride', href: '/rides/post', roles: [UserRole.DRIVER, UserRole.BOTH] },
];

export function RidesSegment({ active }: RidesSegmentProps) {
  const theme = useTheme();
  const router = useRouter();
  const role = useAuthStore((state) => state.user?.role);

  const visible = SEGMENTS.filter((segment) => role && segment.roles.includes(role));

  return (
    <View style={[styles.container, { borderColor: theme.border }]}>
      {visible.map((segment) => {
        const selected = segment.key === active;
        return (
          <Pressable
            key={segment.key}
            accessibilityRole="tab"
            accessibilityState={{ selected }}
            // "Post a ride" opens on top so back works, the others swap in place
            onPress={() =>
              segment.key === 'post' ? router.push(segment.href) : router.replace(segment.href)
            }
            disabled={selected}
            style={[styles.segment, selected && { backgroundColor: theme.primary }]}>
            <ThemedText type="smallBold" themeColor={selected ? 'onPrimary' : 'textSecondary'}>
              {segment.label}
            </ThemedText>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderWidth: 1,
    borderRadius: Spacing.five,
    padding: Spacing.half,
    gap: Spacing.half,
  },
  segment: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.two,
    borderRadius: Spacing.five,
  },
});
