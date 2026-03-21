import { Link, useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Borders, Colors, Fonts, FontSizes, Radii, Spacing } from '@/constants/theme';
import { supabase } from '@/lib/supabase';
import { useBudgetStore } from '@/store/budget-store';

export default function LoginScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const hasCompletedOnboarding = useBudgetStore((s) => s.hasCompletedOnboarding);

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Email and password required');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) throw signInError;

      // Auth state listener in _layout.tsx will handle the redirect,
      // but we can proactively route them to onboarding if needed
      if (data.session) {
        if (!hasCompletedOnboarding) {
          router.replace('/onboarding');
        } else {
          router.replace('/(tabs)');
        }
      }
    } catch (err: any) {
      setError(err.message || 'Failed to sign in');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={[styles.container, { paddingTop: insets.top + Spacing.xl }]}>
        <View style={styles.header}>
          <Text style={styles.title}>Sober.Spend</Text>
          <Text style={styles.subtitle}>Welcome back to financial reality.</Text>
        </View>

        <View style={styles.form}>
          {error ? (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          <View style={styles.inputGroup}>
            <Text style={styles.label}>EMAIL</Text>
            <TextInput
              style={styles.input}
              placeholder="you@dumbspending.com"
              placeholderTextColor={Colors.textMuted}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              value={email}
              onChangeText={setEmail}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>PASSWORD</Text>
            <TextInput
              style={styles.input}
              placeholder="••••••••"
              placeholderTextColor={Colors.textMuted}
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />
          </View>

          <Pressable
            style={({ pressed }) => [
              styles.loginBtn,
              pressed && styles.loginBtnPressed,
            ]}
            onPress={handleLogin}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color={Colors.white} />
            ) : (
              <Text style={styles.loginBtnText}>LOG IN ➔</Text>
            )}
          </Pressable>

          <Link href="/signup" asChild>
            <Pressable style={styles.signupLink}>
              <Text style={styles.signupText}>
                NEW HERE? <Text style={styles.signupTextBold}>GET ROASTED.</Text>
              </Text>
            </Pressable>
          </Link>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#0A0A0A',
  },
  container: {
    flex: 1,
    paddingHorizontal: Spacing.xl,
    justifyContent: 'center',
  },
  header: {
    marginBottom: Spacing.xxl,
  },
  title: {
    fontFamily: Fonts.display,
    fontSize: 56,
    color: Colors.accent,
    lineHeight: 60,
  },
  subtitle: {
    fontFamily: Fonts.display,
    fontSize: FontSizes.lg,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
  },
  form: {
    gap: Spacing.xl,
  },
  inputGroup: {
    gap: Spacing.xs,
  },
  label: {
    fontFamily: Fonts.display,
    fontSize: FontSizes.sm,
    color: Colors.textMuted,
    letterSpacing: 2,
  },
  input: {
    backgroundColor: '#1A1A1A',
    borderWidth: Borders.thick,
    borderColor: Colors.border,
    borderRadius: Radii.md,
    color: Colors.white,
    fontFamily: Fonts.display,
    fontSize: FontSizes.lg,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
  },
  errorBox: {
    backgroundColor: '#FF1A1A20',
    borderWidth: Borders.medium,
    borderColor: '#FF1A1A',
    padding: Spacing.md,
    borderRadius: Radii.sm,
  },
  errorText: {
    fontFamily: Fonts.display,
    color: '#FF1A1A',
    fontSize: FontSizes.md,
    textAlign: 'center',
  },
  loginBtn: {
    backgroundColor: Colors.accent,
    paddingVertical: Spacing.xl,
    borderRadius: Radii.md,
    borderWidth: Borders.thick,
    borderColor: Colors.black,
    alignItems: 'center',
    marginTop: Spacing.lg,
    shadowColor: Colors.white,
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 8,
  },
  loginBtnPressed: {
    transform: [{ translateX: 2 }, { translateY: 2 }],
    shadowOffset: { width: 2, height: 2 },
  },
  loginBtnText: {
    fontFamily: Fonts.display,
    fontSize: FontSizes.xl,
    color: Colors.black,
    letterSpacing: 2,
  },
  signupLink: {
    paddingVertical: Spacing.md,
    alignItems: 'center',
  },
  signupText: {
    fontFamily: Fonts.display,
    fontSize: FontSizes.md,
    color: Colors.textSecondary,
    letterSpacing: 1,
  },
  signupTextBold: {
    color: Colors.accent,
  },
});
