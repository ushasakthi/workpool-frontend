import { useEffect, useState } from 'react';
import { Animated, type DimensionValue, Easing, Platform } from 'react-native';

import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

interface SkeletonProps {
  width?: DimensionValue;
  height?: number;
  radius?: number;
  /** Render as a circle of `height` diameter (ignores width/radius). */
  circle?: boolean;
  style?: object;
}

// A single shimmer placeholder block. Compose several to mirror the shape of the
// content that's loading (see the profile / travel-profile loading states).
export function Skeleton({ width = '100%', height = 16, radius = Spacing.two, circle = false, style }: SkeletonProps) {
  const theme = useTheme();
  const [pulse] = useState(() => new Animated.Value(0));

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: 750,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: Platform.OS !== 'web',
        }),
        Animated.timing(pulse, {
          toValue: 0,
          duration: 750,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: Platform.OS !== 'web',
        }),
      ]),
    );
    animation.start();
    return () => animation.stop();
  }, [pulse]);

  const opacity = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.45, 0.9] });

  return (
    <Animated.View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={[
        {
          width: circle ? height : width,
          height,
          borderRadius: circle ? height / 2 : radius,
          backgroundColor: theme.backgroundElement,
          opacity,
        },
        style,
      ]}
    />
  );
}
