import { NeoButton } from '@/components/ui/neo-button';
import { NeoCard } from '@/components/ui/neo-card';
import { Borders, Colors, Fonts, FontSizes, Radii, Spacing } from '@/constants/theme';
import { useAuthStore } from '@/store/auth-store';
import { useBudgetStore } from '@/store/budget-store';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import {
  ArrowLeft,
  Calendar,
  Flame,
  LogOut,
  RefreshCw,
  Scale,
  Settings,
  ShieldAlert,
  Snowflake,
  Target,
  TrendingDown,
  Wallet,
} from 'lucide-react-native';
import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const PERSONA_STYLES: Record<string, { color: string; icon: any; tagline: string }> = {
  Saver: { color: '#00FFFF', icon: Snowflake, tagline: 'Cool, calm, and financially collected.' },
  Balanced: { color: '#DFFF00', icon: Scale, tagline: 'You walk the line. Mostly.' },
  Spender: { color: '#FF85A2', icon: Flame, tagline: 'You live fast. Your wallet cries faster.' },
};

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const {
    userName,
    financialPersonality,
    spendingWeakness,
    primaryGoal,
    weekendVibe,
    purchaseRegret,
    savingsRate,
    monthlyBudget,
    setOnboardingData,
  } = useBudgetStore();

  const { user, signOut } = useAuthStore();

  const handleRetakeTest = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setOnboardingData({ hasCompletedOnboarding: false });
    router.replace('/onboarding' as any);
  };

  const handleSignOut = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    await signOut();
    router.replace('/login');
  };

  const weaknesses = spendingWeakness || [];
  const persona = PERSONA_STYLES[financialPersonality || 'Balanced'];

  const traits = [
    { icon: Target, label: 'GOAL', value: primaryGoal },
    { icon: Calendar, label: 'WEEKENDS', value: weekendVibe },
    { icon: ShieldAlert, label: 'REGRET', value: purchaseRegret },
    { icon: TrendingDown, label: 'SAVES', value: savingsRate },
    { icon: Wallet, label: 'BUDGET', value: `₹${monthlyBudget.toLocaleString('en-IN')}` },
  ].filter((t) => t.value);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <ArrowLeft size={28} color={Colors.white} strokeWidth={2.5} />
        </Pressable>
        <Text style={styles.headerTitle}>
          Sober.<Text style={{ color: persona.color }}>Profile</Text>
        </Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* ── HERO ── */}
        <View style={[styles.heroCard, { borderColor: persona.color }]}>
          <View style={[styles.heroIconCircle, { backgroundColor: persona.color }]}>
            <persona.icon size={40} color={Colors.black} strokeWidth={2.5} />
          </View>
          <Text style={styles.heroName}>{userName || 'Stranger'}</Text>
          {user?.email && <Text style={styles.heroEmail}>{user.email}</Text>}
          <View style={[styles.personaPill, { backgroundColor: persona.color }]}>
            <Text style={styles.personaPillText}>THE {(financialPersonality || 'unknown').toUpperCase()}</Text>
          </View>
          <Text style={styles.heroTagline}>{persona.tagline}</Text>
        </View>

        {/* ── WEAKNESSES ── */}
        <Text style={styles.sectionLabel}>MONEY TRAPS</Text>
        {weaknesses.length > 0 && !weaknesses.includes('None') ? (
          <View style={styles.weaknessRow}>
            {weaknesses.map((w) => (
              <View key={w} style={styles.weaknessChip}>
                <Flame size={14} color={Colors.black} strokeWidth={2.5} />
                <Text style={styles.weaknessText}>{w}</Text>
              </View>
            ))}
          </View>
        ) : (
          <NeoCard color={Colors.surface} style={styles.emptyCard}>
            <Text style={styles.emptyText}>
              No weaknesses? Bold claim. 😏
            </Text>
          </NeoCard>
        )}

        {/* ── TRAITS GRID ── */}
        <Text style={[styles.sectionLabel, { marginTop: Spacing.xl }]}>YOUR PROFILE</Text>
        <View style={styles.traitsGrid}>
          {traits.map((trait) => {
            const Icon = trait.icon;
            return (
              <View key={trait.label} style={styles.traitCard}>
                <View style={styles.traitIconBox}>
                  <Icon size={18} color={Colors.black} strokeWidth={2.5} />
                </View>
                <Text style={styles.traitLabel}>{trait.label}</Text>
                <Text style={styles.traitValue} numberOfLines={2}>
                  {trait.value}
                </Text>
              </View>
            );
          })}
        </View>

        {/* ── ACTIONS ── */}
        <Text style={[styles.sectionLabel, { marginTop: Spacing.xl }]}>ACTIONS</Text>

        <NeoButton
          title="App Settings & Budgets"
          variant="outline"
          size="lg"
          icon={<Settings size={20} color={Colors.white} />}
          onPress={() => router.push('/config')}
          style={{ marginBottom: Spacing.md }}
        />

        <NeoButton
          title="Retake Persona Test"
          variant="outline"
          size="lg"
          icon={<RefreshCw size={20} color={Colors.white} />}
          onPress={handleRetakeTest}
          style={{ marginBottom: Spacing.md }}
        />

        <NeoButton
          title="Sign Out"
          variant="danger"
          size="lg"
          icon={<LogOut size={20} color={Colors.white} />}
          onPress={handleSignOut}
        />

        <View style={{ height: 80 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
  },
  backBtn: { padding: Spacing.xs },
  headerTitle: {
    fontFamily: Fonts.display,
    fontSize: FontSizes.xl,
    color: Colors.white,
  },
  scroll: { flex: 1 },
  content: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.sm,
  },

  /* ── Hero ── */
  heroCard: {
    alignItems: 'center',
    paddingVertical: Spacing.xxl,
    paddingHorizontal: Spacing.lg,
    backgroundColor: Colors.surface,
    borderWidth: Borders.thick,
    borderRadius: Radii.lg,
    marginBottom: Spacing.xl,
    shadowColor: Colors.black,
    shadowOffset: { width: 6, height: 6 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 10,
  },
  heroIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
    borderWidth: 2,
    borderColor: Colors.black,
  },
  heroName: {
    fontFamily: Fonts.display,
    fontSize: 36,
    color: Colors.white,
    textTransform: 'uppercase',
    textAlign: 'center',
  },
  heroEmail: {
    fontFamily: Fonts.display,
    fontSize: FontSizes.md,
    color: Colors.textMuted,
    textAlign: 'center',
    marginTop: -Spacing.xs,
  },
  personaPill: {
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.sm,
    borderRadius: Radii.pill,
    borderWidth: 2,
    borderColor: Colors.black,
    marginTop: Spacing.md,
  },
  personaPillText: {
    fontFamily: Fonts.display,
    fontSize: FontSizes.sm,
    color: Colors.black,
    fontWeight: '800',
    letterSpacing: 3,
  },
  heroTagline: {
    fontFamily: Fonts.display,
    fontSize: FontSizes.md,
    color: Colors.textMuted,
    textAlign: 'center',
    marginTop: Spacing.md,
    fontStyle: 'italic',
  },

  /* ── Sections ── */
  sectionLabel: {
    fontFamily: Fonts.display,
    fontSize: FontSizes.xs,
    color: Colors.textMuted,
    letterSpacing: 3,
    marginBottom: Spacing.md,
  },

  /* ── Weaknesses ── */
  weaknessRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  weaknessChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FF85A2',
    paddingHorizontal: Spacing.lg,
    paddingVertical: 10,
    borderRadius: Radii.pill,
    borderWidth: 2,
    borderColor: Colors.black,
    shadowColor: Colors.black,
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4,
  },
  weaknessText: {
    fontFamily: Fonts.display,
    fontSize: FontSizes.md,
    color: Colors.black,
    fontWeight: '700',
  },
  emptyCard: {
    padding: Spacing.lg,
  },
  emptyText: {
    fontFamily: Fonts.display,
    fontSize: FontSizes.md,
    color: Colors.textSecondary,
    textAlign: 'center',
  },

  /* ── Traits Grid ── */
  traitsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  traitCard: {
    width: '48%',
    backgroundColor: Colors.surface,
    borderWidth: Borders.thick,
    borderColor: Colors.border,
    borderRadius: Radii.md,
    padding: Spacing.md,
    shadowColor: Colors.black,
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4,
  },
  traitIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#DFFF00',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  traitLabel: {
    fontFamily: Fonts.display,
    fontSize: 10,
    color: Colors.textMuted,
    letterSpacing: 2,
    marginBottom: 2,
  },
  traitValue: {
    fontFamily: Fonts.display,
    fontSize: FontSizes.md,
    color: Colors.white,
    fontWeight: '700',
  },
});
