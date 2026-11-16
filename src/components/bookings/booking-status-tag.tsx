import { SymbolView } from 'expo-symbols';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { BookingStatus } from '@/constants/booking-status.enum';
import { Icons } from '@/constants/icons';
import { Spacing, type ThemeColor } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

interface TagStyle {
  label: string;
  icon: keyof typeof Icons;
  background: ThemeColor | 'none';
  text: ThemeColor;
  // dashed outline marks "still waiting"
  dashed: boolean;
}

// every status has its own icon, word and shape, not just a colour
const TAGS: Record<BookingStatus, TagStyle> = {
  [BookingStatus.REQUESTED]: {
    label: 'Requested',
    icon: 'clock',
    background: 'none',
    text: 'text',
    dashed: true,
  },
  [BookingStatus.ACCEPTED]: {
    label: 'Accepted',
    icon: 'checkCircle',
    background: 'primarySoft',
    text: 'primarySoftText',
    dashed: false,
  },
  [BookingStatus.REJECTED]: {
    label: 'Declined',
    icon: 'xmarkCircle',
    background: 'errorSoft',
    text: 'error',
    dashed: false,
  },
  [BookingStatus.CANCELLED]: {
    label: 'Cancelled',
    icon: 'xmarkCircle',
    background: 'backgroundElement',
    text: 'textSecondary',
    dashed: false,
  },
  [BookingStatus.COMPLETED]: {
    label: 'Completed',
    icon: 'flag',
    background: 'backgroundElement',
    text: 'text',
    dashed: false,
  },
  [BookingStatus.NOT_PICKED_UP]: {
    label: 'Not picked up',
    icon: 'xmarkCircle',
    background: 'warningSoft',
    text: 'warning',
    dashed: false,
  },
};

export function BookingStatusTag({ status }: { status: BookingStatus }) {
  const theme = useTheme();
  const tag = TAGS[status];

  return (
    <View
      style={[
        styles.tag,
        tag.background !== 'none' && { backgroundColor: theme[tag.background] },
        tag.dashed && { ...styles.dashed, borderColor: theme.textSecondary },
      ]}>
      <SymbolView name={Icons[tag.icon]} size={14} tintColor={theme[tag.text]} />
      <ThemedText type="smallBold" themeColor={tag.text}>
        {tag.label}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
    borderRadius: Spacing.five,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.one,
  },
  dashed: {
    borderWidth: 1.5,
    borderStyle: 'dashed',
  },
});
