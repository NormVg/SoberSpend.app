import { NeoCard } from '@/components/ui/neo-card';
import { API_BASE_URL } from '@/constants/api';
import { Borders, Colors, Fonts, FontSizes, Radii, Spacing } from '@/constants/theme';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/auth-store';
import { useBudgetStore } from '@/store/budget-store';
import { useRouter } from 'expo-router';
import { ArrowLeft, Car, Circle, CircleEllipsis, Film, Save, ShoppingBag, Sparkles, Utensils, Zap } from 'lucide-react-native';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Switch, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const iconMap: Record<string, any> = {
  'utensils': Utensils,
  'car': Car,
  'shopping-bag': ShoppingBag,
  'film': Film,
  'zap': Zap,
  'circle-ellipsis': CircleEllipsis,
};

export default function ConfigScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const { monthlyBudget, monthlySavingsTarget, categories, setMonthlyBudget, setMonthlySavingsTarget, setCategoryLimit, isDemoMode, toggleDemoMode } = useBudgetStore();
  const user = useAuthStore((s) => s.user);

  const [budgetInput, setBudgetInput] = useState(monthlyBudget.toString());
  const [savingsInput, setSavingsInput] = useState(monthlySavingsTarget.toString());
  const [categoryInputs, setCategoryInputs] = useState<Record<string, string>>(
    categories.reduce((acc, cat) => ({ ...acc, [cat.id]: cat.budgetLimit.toString() }), {})
  );
  const [isSaving, setIsSaving] = useState(false);
  const [isAISuggesting, setIsAISuggesting] = useState(false);

  const totalAllocated = Object.values(categoryInputs).reduce((sum, val) => sum + (parseInt(val, 10) || 0), 0);
  const budgetNum = parseFloat(budgetInput) || monthlyBudget;
  const remainingToAllocate = budgetNum - totalAllocated;

  const handleBudgetChange = (text: string) => {
    setBudgetInput(text);
  };

  const handleSavingsChange = (text: string) => {
    setSavingsInput(text);
  };

  const handleCategoryChange = (id: string, text: string) => {
    let val = parseInt(text.replace(/[^0-9]/g, ''), 10);
    if (isNaN(val)) val = 0;

    const prevVal = parseInt(categoryInputs[id], 10) || 0;
    const remaining = remainingToAllocate + prevVal;
    if (val > remaining && remaining >= 0) {
      val = remaining;
    }

    const finalStr = text === '' ? '' : val.toString();
    setCategoryInputs(prev => ({ ...prev, [id]: finalStr }));
  };

  const handleSaveAll = async () => {
    if (!user) { Alert.alert('Error', 'Not logged in'); return; }
    setIsSaving(true);
    try {
      const newBudget = parseFloat(budgetInput) || monthlyBudget;
      const newSavings = parseFloat(savingsInput) || monthlySavingsTarget;

      // Build a full limitsMap from current input state
      const limitsMap: Record<string, number> = {};
      for (const [id, valStr] of Object.entries(categoryInputs)) {
        limitsMap[id] = parseInt(valStr, 10) || 0;
      }

      // Apply to local store
      useBudgetStore.getState().setCategoriesData(limitsMap);

      // Flush all settings to Supabase in parallel — one write per field
      await Promise.all([
        setMonthlyBudget(newBudget),
        setMonthlySavingsTarget(newSavings),
        supabase.from('Users').update({ category_limits: limitsMap }).eq('id', user!.id),
      ]);

      Alert.alert('Saved! ✓', 'Your settings have been synced to the cloud.');
    } catch (e) {
      Alert.alert('Error', 'Failed to save settings.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleAISuggest = async () => {
    if (!user) { Alert.alert('Error', 'Not logged in'); return; }
    setIsAISuggesting(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/suggest-budget`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: user.id }),
      });
      const json = await response.json();
      if (!response.ok) throw new Error(json.message || 'AI failed');

      const { monthly_budget, monthly_savings_target, category_limits, reasoning } = json.data;
      setBudgetInput(monthly_budget.toString());
      setSavingsInput(monthly_savings_target.toString());
      if (category_limits && typeof category_limits === 'object') {
        setCategoryInputs((prev) => {
          const next = { ...prev };
          for (const [k, v] of Object.entries(category_limits as Record<string, number>)) {
            if (k in next) next[k] = String(v);
          }
          return next;
        });
      }

      Alert.alert(
        '🤖 AI Suggestion',
        `Budget: ₹${monthly_budget.toLocaleString('en-IN')}\nSavings: ₹${monthly_savings_target.toLocaleString('en-IN')}\n\n"${reasoning}"\n\nTap SAVE SETTINGS to apply.`
      );
    } catch (e: any) {
      Alert.alert('AI Error', e.message || 'Could not get AI suggestion.');
    } finally {
      setIsAISuggesting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={[styles.header, { paddingTop: insets.top + Spacing.md }]}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={28} color={Colors.white} />
        </Pressable>
        <Text style={styles.headerTitle}>Configuration</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + Spacing.xxl }]}>

        {/* AI Suggest Row */}
        <NeoCard style={{ ...styles.card, marginTop: Spacing.md }} color="#1A1A2E">
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <View style={{ flex: 1, marginRight: Spacing.md }}>
              <Text style={[styles.label, { color: '#A78BFA', marginBottom: 2 }]}>✦ AI Budget Advisor</Text>
              <Text style={{ fontFamily: Fonts.display, fontSize: FontSizes.sm, color: Colors.textMuted }}>
                Let AI read your profile &amp; suggest limits
              </Text>
            </View>
            <Pressable
              style={[styles.aiBtn, isAISuggesting && { opacity: 0.7 }]}
              onPress={handleAISuggest}
              disabled={isAISuggesting}
            >
              {isAISuggesting
                ? <ActivityIndicator color={Colors.white} size="small" />
                : <><Sparkles size={16} color={Colors.white} strokeWidth={2.5} /><Text style={styles.aiBtnText}> SUGGEST</Text></>
              }
            </Pressable>
          </View>
        </NeoCard>

        {/* Global Budget */}
        <Text style={[styles.sectionTitle, { marginTop: Spacing.md }]}>GLOBAL BUDGET</Text>
        <NeoCard style={styles.card} color={Colors.surface}>
          <Text style={styles.label}>Total Monthly Budget</Text>
          <View style={styles.inputContainer}>
            <Text style={styles.currencyPrefix}>₹</Text>
            <TextInput
              style={styles.textInput}
              keyboardType="number-pad"
              value={budgetInput}
              onChangeText={handleBudgetChange}
              placeholder="0"
              placeholderTextColor={Colors.textMuted}
            />
          </View>
        </NeoCard>

        <NeoCard style={styles.card} color="#DFFF00">
          <Text style={[styles.label, { color: Colors.black }]}>Monthly Savings Target</Text>
          <Text style={{ fontFamily: Fonts.display, fontSize: FontSizes.sm, color: Colors.black, opacity: 0.7, marginBottom: Spacing.sm }}>Used to calculate wishlist goal timelines</Text>
          <View style={[styles.inputContainer, { backgroundColor: Colors.white }]}>
            <Text style={[styles.currencyPrefix, { color: Colors.black }]}>₹</Text>
            <TextInput
              style={[styles.textInput, { color: Colors.black }]}
              keyboardType="number-pad"
              value={savingsInput}
              onChangeText={handleSavingsChange}
              placeholder="5000"
              placeholderTextColor="rgba(0,0,0,0.4)"
            />
          </View>
        </NeoCard>

        {/* Category Limits */}
        <View style={styles.categorySectionHeader}>
          <Text style={styles.sectionTitle}>CATEGORY LIMITS</Text>
          <View style={styles.allocationBadge}>
            <Text style={styles.allocationLabel}>LEFT TO ALLOCATE</Text>
            <Text style={[styles.allocationValue, { color: remainingToAllocate < 0 ? Colors.accent : Colors.safe }]}>
              ₹{remainingToAllocate.toLocaleString()}
            </Text>
          </View>
        </View>

        {categories.map((cat) => {
          const LucideIcon = iconMap[cat.icon] || Circle;

          return (
            <NeoCard key={cat.id} style={styles.card} color={cat.color}>
              <View style={styles.categoryHeader}>
                <View style={styles.categoryIcon}>
                  <LucideIcon size={24} color={Colors.black} strokeWidth={2.5} />
                </View>
                <Text style={styles.categoryName}>{cat.name}</Text>
              </View>
              <View style={[styles.inputContainer, { backgroundColor: Colors.white }]}>
                <Text style={[styles.currencyPrefix, { color: Colors.black }]}>₹</Text>
                <TextInput
                  style={[styles.textInput, { color: Colors.black }]}
                  keyboardType="number-pad"
                  value={categoryInputs[cat.id]}
                  onChangeText={(text) => handleCategoryChange(cat.id, text)}
                  placeholder="0"
                  placeholderTextColor={Colors.textMuted}
                />
              </View>
            </NeoCard>
          )
        })}

        {/* Save Settings Button */}
        <Pressable
          style={[styles.saveBtn, isSaving && { opacity: 0.7 }]}
          onPress={handleSaveAll}
          disabled={isSaving}
        >
          <View style={styles.saveBtnShadow} />
          <View style={styles.saveBtnInner}>
            {isSaving
              ? <ActivityIndicator color={Colors.black} size="small" />
              : <><Save size={20} color={Colors.black} strokeWidth={2.5} /><Text style={styles.saveBtnText}>  SAVE SETTINGS</Text></>
            }
          </View>
        </Pressable>

        {/* Demo Mode — Developer Section at the bottom */}
        <Text style={[styles.sectionTitle, { marginTop: Spacing.xl }]}>DEVELOPER</Text>
        <NeoCard style={{ marginBottom: Spacing.md }} color={Colors.surface}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <View style={{ flex: 1, marginRight: Spacing.md }}>
              <Text style={[styles.label, { marginBottom: 0, color: Colors.white }]}>Demo Mode</Text>
              <Text style={{ fontFamily: Fonts.display, fontSize: FontSizes.sm, color: Colors.textMuted, marginTop: 4 }}>
                Toggle sample data for testing
              </Text>
            </View>
            <Switch
              value={isDemoMode}
              onValueChange={toggleDemoMode}
              trackColor={{ false: Colors.border, true: Colors.accent }}
              thumbColor={Colors.white}
            />
          </View>
        </NeoCard>

      </ScrollView>
    </KeyboardAvoidingView>
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
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  backButton: {
    padding: Spacing.xs,
  },
  headerTitle: {
    fontFamily: Fonts.accent,
    fontSize: FontSizes.xl,
    color: Colors.white,
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
  },
  categorySectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: Spacing.xl,
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    fontFamily: Fonts.display,
    fontSize: FontSizes.lg,
    color: Colors.textSecondary,
    letterSpacing: 2,
  },
  allocationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#222',
    borderWidth: 2,
    borderColor: Colors.borderLight,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: Radii.pill,
  },
  allocationLabel: {
    fontFamily: Fonts.display,
    fontSize: FontSizes.xs,
    color: Colors.textMuted,
    marginRight: Spacing.xs,
  },
  allocationValue: {
    fontFamily: Fonts.display,
    fontSize: FontSizes.sm,
  },
  card: {
    marginBottom: Spacing.md,
    width: '100%',
  },
  label: {
    fontFamily: Fonts.display,
    fontSize: FontSizes.md,
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#333',
    borderWidth: Borders.thick,
    borderColor: Colors.black,
    borderRadius: Radii.md,
    paddingHorizontal: Spacing.md,
    height: 56,
  },
  currencyPrefix: {
    fontFamily: Fonts.display,
    fontSize: FontSizes.xl,
    color: Colors.white,
    marginRight: Spacing.sm,
  },
  textInput: {
    flex: 1,
    fontFamily: Fonts.display,
    fontSize: FontSizes.xl,
    color: Colors.white,
    height: '100%',
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  categoryIcon: {
    fontSize: 24,
    marginRight: Spacing.sm,
  },
  categoryName: {
    fontFamily: Fonts.display,
    fontSize: FontSizes.lg,
    color: Colors.black,
    textTransform: 'uppercase',
  },
  aiBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#7C3AED',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radii.pill,
    borderWidth: 2,
    borderColor: Colors.black,
  },
  aiBtnText: {
    fontFamily: Fonts.display,
    fontSize: FontSizes.sm,
    color: Colors.white,
    letterSpacing: 1,
  },
  saveBtn: {
    marginTop: Spacing.lg,
    marginBottom: Spacing.md,
    height: 60,
  },
  saveBtnShadow: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: Colors.black,
    borderRadius: Radii.lg,
    top: 4,
    left: 4,
  },
  saveBtnInner: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#DFFF00',
    borderRadius: Radii.lg,
    borderWidth: 3,
    borderColor: Colors.black,
  },
  saveBtnText: {
    fontFamily: Fonts.display,
    fontSize: FontSizes.lg,
    color: Colors.black,
    letterSpacing: 2,
  },
});
