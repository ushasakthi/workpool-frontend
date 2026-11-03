import { SymbolView } from 'expo-symbols';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Icons } from '@/constants/icons';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

interface QuickActionsProps {
  // passengers only get Find, drivers only get Offer, "both" get the two
  onFind?: () => void;
  onOffer?: () => void;
  // passengers: a link under the button to start offering rides too
  onSwitchRole?: () => void;
}

export function QuickActions({ onFind, onOffer, onSwitchRole }: QuickActionsProps) {
  const theme = useTheme();

  // one action gets a full-width row with a subtitle instead of a half tile
  if (onFind && !onOffer) {
    return (
      <View style={styles.single}>
        <WideAction
          icon="search"
          title="Find a ride"
          subtitle="Coworkers on your route"
          solid
          onPress={onFind}
        />
        {onSwitchRole && (
          <ThemedText type="small" themeColor="textSecondary" style={styles.switchText}>
            Want to offer rides too?{' '}
            <ThemedText type="smallBold" themeColor="primary" onPress={onSwitchRole}>
              Switch in Profile
            </ThemedText>
          </ThemedText>
        )}
      </View>
    );
  }
  if (onOffer && !onFind) {
    return (
      <WideAction
        icon="add"
        title="Offer a ride"
        subtitle="Share your commute costs"
        onPress={onOffer}
      />
    );
  }

  return (
    <View style={styles.row}>
      <Pressable
        accessibilityRole="button"
        onPress={onFind}
        style={[styles.tile, { backgroundColor: theme.primary }]}>
        <SymbolView name={Icons.search} size={22} tintColor={theme.onPrimary} />
        <ThemedText type="smallBold" themeColor="onPrimary" style={styles.label}>
          Find a ride
        </ThemedText>
      </Pressable>
      <Pressable
        accessibilityRole="button"
        onPress={onOffer}
        style={[styles.tile, { backgroundColor: theme.primarySoft }]}>
        <SymbolView name={Icons.add} size={22} tintColor={theme.primarySoftText} />
        <ThemedText type="smallBold" themeColor="primarySoftText" style={styles.label}>
          Offer a ride
        </ThemedText>
      </Pressable>
    </View>
  );
}

interface WideActionProps {
  icon: keyof typeof Icons;
  title: string;
  subtitle: string;
  // solid green for Find, soft green for Offer (same as the two tiles)
  solid?: boolean;
  onPress: () => void;
}

function WideAction({ icon, title, subtitle, solid = false, onPress }: WideActionProps) {
  const theme = useTheme();
  const textColor = solid ? 'onPrimary' : 'primarySoftText';

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={[styles.wide, { backgroundColor: solid ? theme.primary : theme.primarySoft }]}>
      <View
        style={[
          styles.iconCircle,
          { backgroundColor: solid ? 'rgba(255,255,255,0.18)' : theme.background },
        ]}>
        <SymbolView name={Icons[icon]} size={22} tintColor={theme[textColor]} />
      </View>
      <View style={styles.grow}>
        <ThemedText type="smallBold" themeColor={textColor} style={styles.wideTitle}>
          {title}
        </ThemedText>
        <ThemedText type="small" themeColor={textColor}>
          {subtitle}
        </ThemedText>
      </View>
      <SymbolView name={Icons.chevronRight} size={18} tintColor={theme[textColor]} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 10,
  },
  tile: {
    flex: 1,
    minHeight: 84,
    borderRadius: Spacing.three,
    padding: 14,
    justifyContent: 'space-between',
  },
  label: {
    fontSize: 16,
  },
  single: {
    gap: 12,
  },
  wide: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    borderRadius: Spacing.three,
    padding: Spacing.three,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  grow: {
    flex: 1,
  },
  wideTitle: {
    fontSize: 18,
    lineHeight: 24,
  },
  switchText: {
    textAlign: 'center',
  },
});
