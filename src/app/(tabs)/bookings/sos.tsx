import { useLocalSearchParams, useRouter } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { useState } from 'react';
import { ActivityIndicator, Linking, Platform, Pressable, StyleSheet, View } from 'react-native';

import { triggerSos } from '@/api/sos.api';
import { ThemedText } from '@/components/themed-text';
import { Banner } from '@/components/ui/banner';
import { Button } from '@/components/ui/button';
import { Screen } from '@/components/ui/screen';
import { Icons } from '@/constants/icons';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useAuthStore } from '@/stores/useAuthStore';
import { getErrorMessage } from '@/utils/errors';

// Sri Lanka Police emergency line
const EMERGENCY_NUMBER = '119';

// opens Messages with the number and text filled in; iOS joins the body with
// "&", Android with "?"
function smsUrl(phone: string, message: string): string {
  const separator = Platform.OS === 'ios' ? '&' : '?';
  return `sms:${phone}${separator}body=${encodeURIComponent(message)}`;
}

export default function SosScreen() {
  const router = useRouter();
  const { bookingId } = useLocalSearchParams<{ bookingId: string }>();
  const contact = useAuthStore((state) => state.user?.emergencyContact);

  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // a computer can't open Messages, so on web the text is shown to copy instead
  const [webMessage, setWebMessage] = useState<string | null>(null);

  // nothing is sent until this is tapped
  async function alertContact() {
    setError(null);
    setSending(true);
    try {
      const result = await triggerSos(bookingId);
      if (Platform.OS === 'web') {
        setWebMessage(result.message);
      } else {
        await Linking.openURL(smsUrl(result.contact.phone, result.message));
      }
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSending(false);
    }
  }

  return (
    <Screen underTabBar>
      <View style={styles.heading}>
        <ThemedText style={styles.title}>Need help?</ThemedText>
        <ThemedText themeColor="textSecondary">
          {contact
            ? 'Choose what to do. Nothing is sent until you tap.'
            : 'You have no emergency contact yet.'}
        </ThemedText>
      </View>

      {contact && (
        <SosAction
          tone="soft"
          icon="messageAlert"
          title={`Alert ${contact.name.split(' ')[0]}`}
          subtitle="Opens Messages with your ride details"
          loading={sending}
          onPress={() => void alertContact()}
        />
      )}

      <SosAction
        tone="solid"
        icon="phone"
        title={`Call ${EMERGENCY_NUMBER}`}
        subtitle="Police emergency"
        onPress={() => void Linking.openURL(`tel:${EMERGENCY_NUMBER}`)}
      />

      {!contact && (
        <Button
          label="Add emergency contact"
          variant="soft"
          onPress={() => router.push('/profile/emergency-contact')}
        />
      )}

      {error && <Banner message={error} />}
      {webMessage && <WebMessage message={webMessage} />}

      <Button label="Cancel" variant="text" onPress={() => router.back()} />
    </Screen>
  );
}

function SosAction({
  tone,
  icon,
  title,
  subtitle,
  loading = false,
  onPress,
}: {
  tone: 'soft' | 'solid';
  icon: keyof typeof Icons;
  title: string;
  subtitle: string;
  loading?: boolean;
  onPress: () => void;
}) {
  const theme = useTheme();
  const textColor = tone === 'solid' ? 'onPrimary' : 'error';
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${title}. ${subtitle}`}
      disabled={loading}
      onPress={onPress}
      style={[styles.action, { backgroundColor: tone === 'solid' ? theme.error : theme.errorSoft }]}>
      {loading ? (
        <ActivityIndicator color={theme[textColor]} />
      ) : (
        <SymbolView name={Icons[icon]} size={24} tintColor={theme[textColor]} />
      )}
      <View style={styles.grow}>
        <ThemedText themeColor={textColor} style={styles.actionTitle}>
          {title}
        </ThemedText>
        <ThemedText type="small" themeColor={textColor}>
          {subtitle}
        </ThemedText>
      </View>
    </Pressable>
  );
}

function WebMessage({ message }: { message: string }) {
  const theme = useTheme();
  return (
    <View style={[styles.webMessage, { borderColor: theme.border }]}>
      <ThemedText type="smallBold">Alert recorded. Send this message from your phone:</ThemedText>
      <ThemedText type="small" selectable>
        {message}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  heading: {
    gap: Spacing.one,
  },
  title: {
    fontSize: 32,
    lineHeight: 38,
    fontWeight: 800,
  },
  action: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    borderRadius: Spacing.three,
    padding: Spacing.three,
  },
  actionTitle: {
    fontSize: 20,
    lineHeight: 26,
    fontWeight: 700,
  },
  grow: {
    flex: 1,
  },
  webMessage: {
    gap: Spacing.two,
    borderWidth: 1,
    borderRadius: Spacing.three,
    padding: Spacing.three,
  },
});
