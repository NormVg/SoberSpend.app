import { NeoCard } from '@/components/ui/neo-card';
import { Borders, Colors, Fonts, FontSizes, Radii, Spacing } from '@/constants/theme';
import { useBudgetStore } from '@/store/budget-store';
import { useRouter } from 'expo-router';
import { ArrowLeft, Car, Circle, CircleEllipsis, Film, ShoppingBag, Utensils, Zap } from 'lucide-react-native';
import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Switch, Text, TextInput, View } from 'react-native';
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

  const { monthlyBudget, categories, setMonthlyBudget, setCategoryLimit, isDemoMode, toggleDemoMode } = useBudgetStore();

  // Local state for the text inputs to prevent cursor jumping
  const [budgetInput, setBudgetInput] = useState(monthlyBudget.toString());
  const [categoryInputs, setCategoryInputs] = useState<Record<string, string>>(
    categories.reduce((acc, cat) => ({ ...acc, [cat.id]: cat.budgetLimit.toString() }), {})
  );

  const totalAllocated = Object.values(categoryInputs).reduce((sum, val) => sum + (parseInt(val, 10) || 0), 0);
  const remainingToAllocate = monthlyBudget - totalAllocated;

  const handleBudgetChange = (text: string) => {
    setBudgetInput(text);
    const val = parseInt(text.replace(/[^0-9]/g, ''), 10);
    if (!isNaN(val)) {
      setMonthlyBudget(val);
    }
  };

  const handleCategoryChange = (id: string, text: string) => {
    let val = parseInt(text.replace(/[^0-9]/g, ''), 10);
    if (isNaN(val)) val = 0;

    const prevVal = parseInt(categoryInputs[id], 10) || 0;
    const maxAllowed = remainingToAllocate + prevVal;

    // Clamp to available budget pool
    if (val > maxAllowed && maxAllowed >= 0) {
      val = maxAllowed;
    }

    const finalStr = text === '' ? '' : val.toString();
    setCategoryInputs(prev => ({ ...prev, [id]: finalStr }));
    setCategoryLimit(id, val);
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

        {/* Engine Settings */}
        <Text style={styles.sectionTitle}>ENGINE</Text>
        <NeoCard style={{ ...styles.card as object, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: Spacing.md }} color={Colors.surface}>
          <View>
            <Text style={[styles.label, { marginBottom: 0, color: Colors.white }]}>Demo Mode</Text>
            <Text style={{ fontFamily: Fonts.display, fontSize: FontSizes.sm, color: Colors.textMuted, marginTop: 4 }}>
              When OFF, QR scans deep-link to real UPI app.
            </Text>
          </View>
          <Switch
            value={isDemoMode}
            onValueChange={toggleDemoMode}
            trackColor={{ false: Colors.border, true: Colors.accent }}
            thumbColor={Colors.white}
          />
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
});
