import { NeoButton } from '@/components/ui/neo-button';
import { Borders, Colors, Fonts, FontSizes, Radii, Spacing } from '@/constants/theme';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function WaitlistScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [email, setEmail] = useState('');
  const [joined, setJoined] = useState(false);

  const handleJoin = () => {
    if (!email) return;
    setJoined(true);
    // In a real app, API call goes here. For now, simulate success.
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top + Spacing.xxl, paddingBottom: insets.bottom + Spacing.xl }
        ]}
      >
        <Text style={styles.brand}>SOBER.SPEND</Text>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>EARLY ACCESS</Text>
        </View>

        <Text style={styles.headline}>STOP BUYING{'\n'}DUMB SH*T.</Text>
        <Text style={styles.subtext}>
          The financial tracker that actually yells at you when you're about to make a terrible decision. Join the waitlist before your wallet spontaneously combusts.
        </Text>

        {!joined ? (
          <View style={styles.form}>
            <Text style={styles.label}>ENTER YOUR SURVIVAL EMAIL</Text>
            <TextInput
              style={styles.input}
              placeholder="broke@again.com"
              placeholderTextColor="rgba(0,0,0,0.4)"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
            />
            <NeoButton
              title="GET IN LINE"
              variant="primary"
              size="lg"
              onPress={handleJoin}
              style={styles.button}
              textStyle={styles.buttonText}
            />
          </View>
        ) : (
          <View style={styles.successBox}>
            <Text style={styles.successIcon}>☠️</Text>
            <Text style={styles.successTitle}>YOU'RE ON THE LIST.</Text>
            <Text style={styles.successSub}>We'll email you when the gates open. Try not to go bankrupt before then.</Text>
            <NeoButton
              title="ENTER DEMO APP"
              variant="outline"
              size="lg"
              onPress={() => router.replace('/')}
              style={{ marginTop: Spacing.xl, backgroundColor: Colors.white }}
            />
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#DFFF00', // Acid Yellow background for high impact
  },
  content: {
    paddingHorizontal: Spacing.xl,
    flexGrow: 1,
    justifyContent: 'center',
  },
  brand: {
    fontFamily: Fonts.display,
    fontSize: 24,
    color: Colors.black,
    fontWeight: '800',
    marginBottom: Spacing.md,
  },
  badge: {
    backgroundColor: Colors.black,
    alignSelf: 'flex-start',
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderRadius: Radii.pill,
    marginBottom: Spacing.xl,
  },
  badgeText: {
    fontFamily: Fonts.display,
    fontSize: FontSizes.sm,
    color: Colors.white,
    letterSpacing: 2,
  },
  headline: {
    fontFamily: Fonts.display,
    fontSize: 64,
    lineHeight: 64,
    color: Colors.black,
    textTransform: 'uppercase',
    marginBottom: Spacing.md,
  },
  subtext: {
    fontFamily: Fonts.display,
    fontSize: FontSizes.lg,
    color: Colors.black,
    lineHeight: 28,
    marginBottom: Spacing.xxl,
  },
  form: {
    width: '100%',
  },
  label: {
    fontFamily: Fonts.display,
    fontSize: FontSizes.md,
    color: Colors.black,
    letterSpacing: 1,
    marginBottom: Spacing.sm,
  },
  input: {
    backgroundColor: Colors.white,
    borderWidth: 4,
    borderColor: Colors.black,
    borderRadius: Radii.md,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    fontFamily: Fonts.display,
    fontSize: FontSizes.xl,
    color: Colors.black,
    marginBottom: Spacing.lg,
    shadowColor: Colors.white,
    shadowOffset: { width: 8, height: 8 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4,
  },
  button: {
    backgroundColor: Colors.black,
  },
  buttonText: {
    color: '#DFFF00',
    fontSize: 24,
  },
  successBox: {
    backgroundColor: Colors.black,
    padding: Spacing.xl,
    borderRadius: Radii.lg,
    borderWidth: Borders.thick,
    borderColor: Colors.black,
  },
  successIcon: {
    fontSize: 64,
    textAlign: 'center',
    marginBottom: Spacing.md,
  },
  successTitle: {
    fontFamily: Fonts.display,
    fontSize: 32,
    color: '#DFFF00',
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  successSub: {
    fontFamily: Fonts.display,
    fontSize: FontSizes.md,
    color: Colors.white,
    textAlign: 'center',
    lineHeight: 24,
  },
});
