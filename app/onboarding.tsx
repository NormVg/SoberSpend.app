import { NeoButton } from '@/components/ui/neo-button';
import { apiFetch } from '@/constants/api';
import { Borders, Colors, Fonts, FontSizes, Radii, Spacing } from '@/constants/theme';
import { useAuthStore } from '@/store/auth-store';
import { useBudgetStore } from '@/store/budget-store';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { ArrowLeft, Check, FastForward } from 'lucide-react-native';
import React, { useState } from 'react';
import { Animated, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type Step = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

export default function OnboardingScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { setOnboardingData, setMonthlyBudget } = useBudgetStore();

  const [step, setStep] = useState<Step>(0);
  const [fadeAnim] = useState(new Animated.Value(1));

  // Form State
  const [name, setName] = useState('');
  const [goal, setGoal] = useState<string | null>(null);
  const [weaknesses, setWeaknesses] = useState<string[]>([]);
  const [feeling, setFeeling] = useState<string | null>(null);
  const [weekendVibe, setWeekendVibe] = useState<string | null>(null);
  const [purchaseRegret, setPurchaseRegret] = useState<string | null>(null);
  const [savingsRate, setSavingsRate] = useState<string | null>(null);
  const [budgetStr, setBudgetStr] = useState('30000');

  // Animation helper
  const nextStep = (next: Step) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Animated.sequence([
      Animated.timing(fadeAnim, { toValue: 0, duration: 150, useNativeDriver: true }),
    ]).start(() => {
      setStep(next);
      Animated.timing(fadeAnim, { toValue: 1, duration: 250, useNativeDriver: true }).start();
    });
  };

  const handleFinish = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    // Personality Logic -> Basic point system calculation
    let spndPts = 0;
    if (feeling === 'Anxious') spndPts += 2;
    if (feeling === 'Ignorant') spndPts += 1;
    if (weaknesses.includes('Impulse Buy') || weaknesses.includes('Food Delivery')) spndPts += 2;
    if (weekendVibe === 'Going out & spending') spndPts += 2;
    if (purchaseRegret === 'Often') spndPts += 2;
    if (savingsRate === '< 10%') spndPts += 2;

    let personality: 'Saver' | 'Balanced' | 'Spender' = 'Balanced';
    if (spndPts >= 5) personality = 'Spender';
    else if (spndPts <= 1) personality = 'Saver';

    const user_id = useAuthStore.getState().user?.id;

    const bg = parseFloat(budgetStr) || 30000;
    setMonthlyBudget(bg);

    setOnboardingData({
      userName: name.trim() || 'Stranger',
      primaryGoal: goal,
      spendingWeakness: weaknesses,
      weekendVibe,
      purchaseRegret,
      savingsRate,
      financialPersonality: personality,
      hasCompletedOnboarding: true,
    });

    // Fire off context to backend
    if (user_id) {
      const prompt = `User ${name.trim() || 'Stranger'} is a "${personality}". Goal: ${goal}. Weaknesses: ${weaknesses.join(', ')}. Weekend vibe: ${weekendVibe}. Regrets purchases: ${purchaseRegret}. Saves: ${savingsRate}. Budget: ${bg}.`;

      apiFetch('/api/onboarding', {
        method: 'POST',
        body: JSON.stringify({
          user_id,
          bad_habits_prompt: prompt,
        }),
      }).catch(err => console.warn('Failed to sync context to backend:', err));
    }

    router.replace('/(tabs)');
  };

  const canProceed = () => {
    if (step === 0) return name.trim().length > 0;
    if (step === 1) return goal !== null;
    if (step === 2) return weaknesses.length > 0;
    if (step === 3) return feeling !== null;
    if (step === 4) return weekendVibe !== null;
    if (step === 5) return purchaseRegret !== null;
    if (step === 6) return savingsRate !== null;
    if (step === 7) return parseFloat(budgetStr) > 0;
    return true;
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={[styles.header, { paddingTop: insets.top }]}>
        {step > 0 && step < 8 ? (
          <Pressable onPress={() => nextStep((step - 1) as Step)} style={styles.backBtn}>
            <ArrowLeft size={28} color={Colors.white} strokeWidth={2.5} />
          </Pressable>
        ) : <View style={{ width: 48 }} />}

        {step < 8 && (
          <Pressable onPress={handleFinish} style={styles.skipBtn}>
            <Text style={styles.skipText}>SKIP</Text>
            <FastForward size={14} color={Colors.textMuted} />
          </Pressable>
        )}
      </View>

      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">

          {step === 0 && (
            <View style={styles.stepContainer}>
              <Text style={styles.title}>WHAT DO WE{'\n'}CALL YOU?</Text>
              <Text style={styles.subtitle}>Don't worry, we won't tell your mom about your spending habits.</Text>
              <TextInput
                style={styles.hugeInput}
                placeholder="Your Name"
                placeholderTextColor={Colors.textMuted}
                autoFocus
                value={name}
                onChangeText={setName}
                autoCorrect={false}
              />
            </View>
          )}

          {step === 1 && (
            <View style={styles.stepContainer}>
              <Text style={styles.title}>WHY ARE{'\n'}YOU HERE?</Text>

              <View style={styles.chipGrid}>
                {['Stop Overspending', 'Save for a Goal', 'Track Money', 'Just Curious'].map(opt => (
                  <Pressable
                    key={opt}
                    onPress={() => {
                      Haptics.selectionAsync();
                      setGoal(opt);
                    }}
                    style={[
                      styles.chip,
                      goal === opt && styles.chipActive
                    ]}
                  >
                    <Text style={[styles.chipText, goal === opt && styles.chipTextActive]}>{opt}</Text>
                  </Pressable>
                ))}
              </View>
            </View>
          )}

          {step === 2 && (
            <View style={styles.stepContainer}>
              <Text style={styles.title}>WHAT'S YOUR{'\n'}BIGGEST WEAKNESS?</Text>
              <Text style={styles.subtitle}>Be honest. We already know.</Text>

              <View style={styles.chipGrid}>
                {['Food Delivery', 'Impulse Buy', 'Friday Nights', 'Subscriptions', 'None'].map(opt => {
                  const isSelected = weaknesses.includes(opt);
                  return (
                    <Pressable
                      key={opt}
                      onPress={() => {
                        Haptics.selectionAsync();
                        if (opt === 'None') {
                          setWeaknesses(['None']);
                        } else {
                          const newWeaknesses = weaknesses.includes(opt)
                            ? weaknesses.filter(w => w !== opt)
                            : [...weaknesses.filter(w => w !== 'None'), opt];
                          setWeaknesses(newWeaknesses);
                        }
                      }}
                      style={[
                        styles.chip,
                        isSelected && styles.chipActive
                      ]}
                    >
                      <Text style={[styles.chipText, isSelected && styles.chipTextActive]}>{opt}</Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>
          )}

          {step === 3 && (
            <View style={styles.stepContainer}>
              <Text style={styles.title}>HOW DOES YOUR{'\n'}BANK BALANCE{'\n'}MAKE YOU FEEL?</Text>

              <View style={styles.chipGrid}>
                {['Anxious', 'Chill', 'Ignorant'].map(opt => (
                  <Pressable
                    key={opt}
                    onPress={() => {
                      Haptics.selectionAsync();
                      setFeeling(opt);
                    }}
                    style={[
                      styles.chip,
                      feeling === opt && styles.chipActive
                    ]}
                  >
                    <Text style={[styles.chipText, feeling === opt && styles.chipTextActive]}>{opt}</Text>
                  </Pressable>
                ))}
              </View>
            </View>
          )}

          {step === 4 && (
            <View style={styles.stepContainer}>
              <Text style={styles.title}>WHAT'S YOUR{'\n'}TYPICAL WEEKEND?</Text>

              <View style={styles.chipGrid}>
                {['Going out & spending', 'Eating out & movies', 'Staying in & chilling', 'Working'].map(opt => (
                  <Pressable
                    key={opt}
                    onPress={() => {
                      Haptics.selectionAsync();
                      setWeekendVibe(opt);
                    }}
                    style={[
                      styles.chip,
                      weekendVibe === opt && styles.chipActive
                    ]}
                  >
                    <Text style={[styles.chipText, weekendVibe === opt && styles.chipTextActive]}>{opt}</Text>
                  </Pressable>
                ))}
              </View>
            </View>
          )}

          {step === 5 && (
            <View style={styles.stepContainer}>
              <Text style={styles.title}>HOW OFTEN DO{'\n'}YOU REGRET{'\n'}PURCHASES?</Text>

              <View style={styles.chipGrid}>
                {['Often', 'Sometimes', 'Rarely', 'Never'].map(opt => (
                  <Pressable
                    key={opt}
                    onPress={() => {
                      Haptics.selectionAsync();
                      setPurchaseRegret(opt);
                    }}
                    style={[
                      styles.chip,
                      purchaseRegret === opt && styles.chipActive
                    ]}
                  >
                    <Text style={[styles.chipText, purchaseRegret === opt && styles.chipTextActive]}>{opt}</Text>
                  </Pressable>
                ))}
              </View>
            </View>
          )}

          {step === 6 && (
            <View style={styles.stepContainer}>
              <Text style={styles.title}>HOW MUCH OF{'\n'}YOUR INCOME{'\n'}DO YOU SAVE?</Text>

              <View style={styles.chipGrid}>
                {['< 10%', '10% - 20%', '20% - 40%', '> 40%'].map(opt => (
                  <Pressable
                    key={opt}
                    onPress={() => {
                      Haptics.selectionAsync();
                      setSavingsRate(opt);
                    }}
                    style={[
                      styles.chip,
                      savingsRate === opt && styles.chipActive
                    ]}
                  >
                    <Text style={[styles.chipText, savingsRate === opt && styles.chipTextActive]}>{opt}</Text>
                  </Pressable>
                ))}
              </View>
            </View>
          )}

          {step === 7 && (
            <View style={styles.stepContainer}>
              <Text style={styles.title}>SET YOUR{'\n'}SURVIVAL BUDGET.</Text>
              <Text style={styles.subtitle}>How much are you allowed to burn this month?</Text>

              <View style={styles.budgetInputContainer}>
                <Text style={styles.currencySymbol}>₹</Text>
                <TextInput
                  style={styles.budgetInput}
                  placeholder="30000"
                  placeholderTextColor={Colors.textMuted}
                  value={budgetStr}
                  onChangeText={setBudgetStr}
                  keyboardType="numeric"
                  autoFocus
                />
              </View>
            </View>
          )}

          {step === 8 && (
            <View style={styles.stepContainer}>
              <Text style={styles.title}>PROFILE{'\n'}ANALYZED.</Text>

              <View style={styles.reportCard}>
                <Text style={styles.reportLabel}>YOUR PERSONA</Text>
                <Text style={styles.reportValue}>
                  {(() => {
                    let spndPts = 0;
                    if (feeling === 'Anxious') spndPts += 2;
                    if (feeling === 'Ignorant') spndPts += 1;
                    if (weaknesses.includes('Impulse Buy') || weaknesses.includes('Food Delivery')) spndPts += 2;
                    if (weekendVibe === 'Going out & spending') spndPts += 2;
                    if (purchaseRegret === 'Often') spndPts += 2;
                    if (savingsRate === '< 10%') spndPts += 2;
                    if (spndPts >= 5) return 'The Spender';
                    else if (spndPts <= 1) return 'The Saver';
                    return 'The Balanced';
                  })()}
                </Text>

                <Text style={styles.reportLabel}>MONTHLY ALLOWANCE</Text>
                <Text style={styles.reportValue}>₹{parseFloat(budgetStr).toLocaleString('en-IN')}</Text>
              </View>
            </View>
          )}

        </ScrollView>
      </Animated.View>

      <View style={[styles.footer, { paddingBottom: insets.bottom + Spacing.lg }]}>
        <NeoButton
          title={step === 8 ? "ENTER SOBER.SPEND" : "NEXT"}
          variant={canProceed() ? 'primary' : 'outline'}
          size="lg"
          onPress={() => {
            if (!canProceed()) return;
            if (step === 8) handleFinish();
            else nextStep((step + 1) as Step);
          }}
          disabled={!canProceed()}
          icon={step === 8 ? <Check color={Colors.white} size={20} strokeWidth={3} /> : undefined}
        />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    height: 80,
  },
  backBtn: { padding: Spacing.sm },
  skipBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    padding: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radii.pill,
  },
  skipText: {
    fontFamily: Fonts.display,
    fontSize: FontSizes.xs,
    color: Colors.textMuted,
  },
  content: { flex: 1 },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: Spacing.xl,
    justifyContent: 'center',
  },
  stepContainer: {
    paddingVertical: Spacing.xxl,
  },
  title: {
    fontFamily: Fonts.display,
    fontSize: FontSizes.hero,
    color: Colors.white,
    lineHeight: 48,
    textTransform: 'uppercase',
  },
  subtitle: {
    fontFamily: Fonts.display,
    fontSize: FontSizes.lg,
    color: Colors.textSecondary,
    marginTop: Spacing.md,
    lineHeight: 24,
  },
  hugeInput: {
    fontFamily: Fonts.display,
    fontSize: 48,
    color: '#DFFF00',
    marginTop: Spacing.xl,
    paddingVertical: Spacing.md,
    borderBottomWidth: Borders.thick,
    borderBottomColor: Colors.border,
  },
  chipGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
    marginTop: Spacing.xl,
  },
  chip: {
    borderWidth: Borders.thick,
    borderColor: Colors.border,
    borderRadius: Radii.pill,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    backgroundColor: Colors.surface,
  },
  chipActive: {
    backgroundColor: '#FF85A2',
    borderColor: '#FF85A2',
  },
  chipText: {
    fontFamily: Fonts.display,
    fontSize: FontSizes.lg,
    color: Colors.textSecondary,
  },
  chipTextActive: {
    color: Colors.black,
    fontWeight: '700',
  },
  budgetInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.xl,
    borderBottomWidth: Borders.thick,
    borderBottomColor: Colors.border,
  },
  currencySymbol: {
    fontFamily: Fonts.display,
    fontSize: 48,
    color: '#DFFF00',
    marginRight: Spacing.sm,
  },
  budgetInput: {
    flex: 1,
    fontFamily: Fonts.display,
    fontSize: 48,
    color: '#DFFF00',
    paddingVertical: Spacing.md,
  },
  reportCard: {
    backgroundColor: '#00FFFF',
    padding: Spacing.xl,
    borderRadius: Radii.lg,
    borderWidth: Borders.thick,
    borderColor: Colors.black,
    marginTop: Spacing.xl,
    shadowColor: Colors.black,
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 8,
  },
  reportLabel: {
    fontFamily: Fonts.display,
    fontSize: FontSizes.sm,
    color: Colors.black,
    opacity: 0.6,
    letterSpacing: 2,
    marginTop: Spacing.lg,
  },
  reportValue: {
    fontFamily: Fonts.display,
    fontSize: FontSizes.xxl,
    color: Colors.black,
    fontWeight: '700',
    marginTop: 4,
  },
  footer: {
    paddingHorizontal: Spacing.xl,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: Spacing.md,
  },
});
