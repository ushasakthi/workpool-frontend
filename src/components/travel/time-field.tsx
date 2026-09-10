import { SymbolView } from 'expo-symbols';
import { useState } from 'react';
import { FlatList, Modal, Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Icons } from '@/constants/icons';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { formatHhMmForDisplay, HALF_HOUR_SLOTS } from '@/utils/time';

interface TimeFieldProps {
  label: string;
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function TimeField({ label, value, onChange, placeholder = 'Select' }: TimeFieldProps) {
  const theme = useTheme();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <View style={styles.container}>
      <ThemedText type="smallBold" themeColor="textSecondary" style={styles.label}>
        {label}
      </ThemedText>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${label}: ${value ? formatHhMmForDisplay(value) : placeholder}`}
        onPress={() => setIsOpen(true)}
        style={[styles.trigger, { backgroundColor: theme.backgroundElement }]}>
        <ThemedText themeColor={value ? 'text' : 'placeholder'}>
          {value ? formatHhMmForDisplay(value) : placeholder}
        </ThemedText>
        <SymbolView name={Icons.chevronDown} size={16} tintColor={theme.textSecondary} />
      </Pressable>

      <Modal transparent animationType="fade" visible={isOpen} onRequestClose={() => setIsOpen(false)}>
        <Pressable style={styles.backdrop} onPress={() => setIsOpen(false)}>
          <View style={[styles.sheet, { backgroundColor: theme.background }]}>
            <ThemedText type="smallBold" style={styles.sheetTitle}>
              {label}
            </ThemedText>
            <FlatList
              data={HALF_HOUR_SLOTS}
              keyExtractor={(item) => item}
              style={styles.list}
              renderItem={({ item }) => {
                const selected = item === value;
                return (
                  <Pressable
                    onPress={() => {
                      onChange(item);
                      setIsOpen(false);
                    }}
                    style={[styles.option, selected && { backgroundColor: theme.primarySoft }]}>
                    <ThemedText type={selected ? 'smallBold' : 'small'} themeColor={selected ? 'primary' : 'text'}>
                      {formatHhMmForDisplay(item)}
                    </ThemedText>
                    {selected && (
                      <SymbolView name={Icons.check} size={16} tintColor={theme.primary} />
                    )}
                  </Pressable>
                );
              }}
            />
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: Spacing.two,
  },
  label: {
    letterSpacing: 0.4,
  },
  trigger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: Spacing.three,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.three,
  },
  backdrop: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  sheet: {
    borderTopLeftRadius: Spacing.four,
    borderTopRightRadius: Spacing.four,
    paddingTop: Spacing.three,
    paddingBottom: Spacing.five,
    maxHeight: '70%',
  },
  sheetTitle: {
    textAlign: 'center',
    paddingBottom: Spacing.two,
  },
  list: {
    paddingHorizontal: Spacing.three,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.three,
    borderRadius: Spacing.two,
  },
});
