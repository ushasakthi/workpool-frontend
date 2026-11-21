import { SymbolView } from "expo-symbols";
import { useState } from "react";
import { FlatList, Modal, Pressable, StyleSheet, View } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { Icons } from "@/constants/icons";
import { Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";

// Backend CreateVehicleDto caps seatsAvailable at 8.
const SEAT_OPTIONS = [1, 2, 3, 4, 5, 6, 7, 8];

interface SeatsFieldProps {
  label: string;
  value?: number;
  onChange: (value: number) => void;
  error?: string;
  max?: number;
}

function seatLabel(n: number): string {
  return `${n} seat${n === 1 ? "" : "s"}`;
}

export function SeatsField({
  label,
  value,
  onChange,
  error,
  max = 8,
}: SeatsFieldProps) {
  const theme = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const options = SEAT_OPTIONS.filter((n) => n <= max);

  return (
    <View style={styles.container}>
      <ThemedText type="smallBold">{label}</ThemedText>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${label}: ${value ? seatLabel(value) : "Select seats"}`}
        onPress={() => setIsOpen(true)}
        style={[
          styles.trigger,
          {
            backgroundColor: theme.backgroundElement,
            borderColor: error ? theme.error : "transparent",
          },
        ]}
      >
        <ThemedText themeColor={value ? "text" : "placeholder"}>
          {value ? seatLabel(value) : "Select seats"}
        </ThemedText>
        <SymbolView
          name={Icons.chevronDown}
          size={16}
          tintColor={theme.textSecondary}
        />
      </Pressable>
      {error && (
        <ThemedText type="small" themeColor="error">
          {error}
        </ThemedText>
      )}

      <Modal
        transparent
        animationType="fade"
        visible={isOpen}
        onRequestClose={() => setIsOpen(false)}
      >
        <Pressable style={styles.backdrop} onPress={() => setIsOpen(false)}>
          <View style={[styles.sheet, { backgroundColor: theme.background }]}>
            <ThemedText type="smallBold" style={styles.sheetTitle}>
              {label}
            </ThemedText>
            <FlatList
              data={options}
              keyExtractor={(item) => String(item)}
              style={styles.list}
              renderItem={({ item }) => {
                const selected = item === value;
                return (
                  <Pressable
                    accessibilityRole="button"
                    accessibilityState={{ selected }}
                    onPress={() => {
                      onChange(item);
                      setIsOpen(false);
                    }}
                    style={[
                      styles.option,
                      selected && { backgroundColor: theme.primarySoft },
                    ]}
                  >
                    <ThemedText
                      type={selected ? "smallBold" : "small"}
                      themeColor={selected ? "primary" : "text"}
                    >
                      {seatLabel(item)}
                    </ThemedText>
                    {selected && (
                      <SymbolView
                        name={Icons.check}
                        size={16}
                        tintColor={theme.primary}
                      />
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
    gap: Spacing.two,
  },
  trigger: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderRadius: Spacing.three,
    borderWidth: 1.5,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.three,
  },
  backdrop: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  sheet: {
    borderTopLeftRadius: Spacing.four,
    borderTopRightRadius: Spacing.four,
    paddingTop: Spacing.three,
    paddingBottom: Spacing.five,
    maxHeight: "70%",
  },
  sheetTitle: {
    textAlign: "center",
    paddingBottom: Spacing.two,
  },
  list: {
    paddingHorizontal: Spacing.three,
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.three,
    borderRadius: Spacing.two,
  },
});
