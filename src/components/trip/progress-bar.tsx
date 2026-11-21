import { StyleSheet, View } from 'react-native';

interface ProgressBarProps {
  // 0 to 1
  value: number;
  color: string;
  trackColor: string;
}

export function ProgressBar({ value, color, trackColor }: ProgressBarProps) {
  return (
    <View style={[styles.track, { backgroundColor: trackColor }]}>
      <View style={[styles.fill, { width: `${Math.round(value * 100)}%`, backgroundColor: color }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 3,
  },
});
