import { BudgetImpact } from '@/components/decision/budget-impact';
import { WarningBanner } from '@/components/decision/warning-banner';
import { NeoButton } from '@/components/ui/neo-button';
import { NeoCard } from '@/components/ui/neo-card';
import { Colors, Fonts, FontSizes, Radii, Spacing } from '@/constants/theme';
import { useBudgetStore } from '@/store/budget-store';
import { useExpenseStore } from '@/store/expense-store';
import { currentMonthExpenses } from '@/utils/budget-engine';
import { evaluateTransaction } from '@/utils/decision-engine';
import { formatCurrency } from '@/utils/format';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { AlertTriangle, Car, CheckCircle, CircleEllipsis, Film, ShoppingBag, Sparkles, Target, Utensils, Zap } from 'lucide-react-native';
import React, { useState } from 'react';
import { Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const iconMap: Record<string, any> = {
  'utensils': Utensils, 'car': Car, 'shopping-bag': ShoppingBag,
  'film': Film, 'zap': Zap, 'circle-ellipsis': CircleEllipsis,
};

export default function DecisionScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const pendingTransaction = useExpenseStore((s) => s.pendingTransaction);
  const confirmPending = useExpenseStore((s) => s.confirmPendingTransaction);
  const setPending = useExpenseStore((s) => s.setPendingTransaction);
  const expenses = useExpenseStore((s) => s.expenses);
  const { monthlyBudget, categories, isDemoMode } = useBudgetStore();

  // Allow overriding category when auto-detect returns 'other'
  const [overrideCategoryId, setOverrideCategoryId] = useState<string | null>(null);

  if (!pendingTransaction) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>No pending transaction</Text>
          <NeoButton title="Go Back" variant="outline" onPress={() => router.back()} />
        </View>
      </View>
    );
  }

  const effectiveCategoryId = overrideCategoryId || pendingTransaction.category;
  const isUnknown = effectiveCategoryId === 'other' && !overrideCategoryId;
  const category = categories.find((c) => c.id === effectiveCategoryId) || categories.find((c) => c.id === 'other') || categories[0];

  const monthExpenses = currentMonthExpenses(expenses);
  const decision = evaluateTransaction(
    pendingTransaction.merchant,
    pendingTransaction.amount,
    category,
    monthExpenses,
    monthlyBudget
  );

  const handlePay = async () => {
    if (isUnknown) return; // force category pick first
    Haptics.notificationAsync(
      decision.warningLevel === 'exceeded'
        ? Haptics.NotificationFeedbackType.Warning
        : Haptics.NotificationFeedbackType.Success
    );

    // Update pending with the overridden category before confirming locally
    if (overrideCategoryId) {
      setPending({ ...pendingTransaction, category: overrideCategoryId });
    }

    // confirmPending handles BOTH local state and the full Supabase write
    await confirmPending();

    if (!isDemoMode && pendingTransaction) {
      const upiUrl = `upi://pay?pa=merchant@upi&pn=${encodeURIComponent(pendingTransaction.merchant)}&am=${pendingTransaction.amount}&tn=${encodeURIComponent(pendingTransaction.note || pendingTransaction.merchant)}`;
      Linking.openURL(upiUrl).catch(() => { });
    }

    router.dismissAll();
  };

  const handleCancel = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setPending(null);
    router.dismissAll();
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerLabel}>Payment Review</Text>
        </View>

        {/* Amount & Merchant */}
        <View style={styles.amountSection}>
          <Text style={styles.amount}>{formatCurrency(pendingTransaction.amount)}</Text>
          <Text style={styles.merchant}>{pendingTransaction.merchant}</Text>
          {pendingTransaction.note && (
            <Text style={styles.note}>{pendingTransaction.note}</Text>
          )}
        </View>

        {/* AI Roast Card */}
        {pendingTransaction.aiRoast && (
          <NeoCard color={Colors.surface} style={{ marginBottom: Spacing.xl, borderColor: '#FF1A1A', borderWidth: 3 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.sm, gap: Spacing.sm }}>
              <Sparkles size={18} color="#FF1A1A" strokeWidth={2.5} />
              <Text style={{ fontFamily: Fonts.display, fontSize: FontSizes.sm, color: '#FF1A1A', letterSpacing: 2 }}>
                OLLAMA VERDICT
              </Text>
            </View>
            <Text style={{ fontFamily: Fonts.display, fontSize: FontSizes.lg, color: Colors.white, lineHeight: 28 }}>
              "{pendingTransaction.aiRoast}"
            </Text>
          </NeoCard>
        )}

        {/* Category picker — always visible, pre-selected if known */}
        <View style={styles.categorySection}>
          <Text style={styles.categoryLabel}>
            {isUnknown ? '⚠️  UNKNOWN CATEGORY — PICK ONE' : 'CATEGORY'}
          </Text>
          <View style={styles.chipGrid}>
            {categories.filter((c) => c.id !== 'other').map((cat) => {
              const isSelected = effectiveCategoryId === cat.id;
              const LucideIcon = iconMap[cat.icon] || Target;
              return (
                <Pressable
                  key={cat.id}
                  onPress={() => {
                    Haptics.selectionAsync();
                    setOverrideCategoryId(cat.id);
                  }}
                  style={[
                    styles.chip,
                    { borderColor: isSelected ? cat.color : Colors.border },
                    isSelected && { backgroundColor: cat.color },
                  ]}
                >
                  <LucideIcon
                    size={14}
                    color={isSelected ? Colors.black : Colors.textSecondary}
                    strokeWidth={2.5}
                  />
                  <Text style={[
                    styles.chipText,
                    { color: isSelected ? Colors.black : Colors.textSecondary }
                  ]}>
                    {cat.name}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* Budget Impact — only when category is known */}
        {!isUnknown && (
          <>
            <View style={{ marginBottom: Spacing.lg }}>
              <BudgetImpact
                category={category}
                currentSpent={decision.currentSpent}
                currentPercent={decision.currentPercent}
                projectedSpent={decision.projectedSpent}
                projectedPercent={decision.projectedPercent}
              />
            </View>

            <View style={{ marginBottom: Spacing.xl }}>
              <WarningBanner
                level={decision.warningLevel}
                message={decision.warningMessage}
              />
            </View>

            <View style={styles.totalImpact}>
              <Text style={styles.totalLabel}>Total Monthly Budget</Text>
              <Text style={styles.totalValue}>
                {decision.totalCurrentPercent}% → {decision.totalProjectedPercent}%
              </Text>
            </View>
          </>
        )}
      </ScrollView>

      {/* Action Buttons */}
      <View style={[styles.actions, { paddingBottom: insets.bottom + Spacing.md }]}>
        <NeoButton
          title={isUnknown ? 'SELECT A CATEGORY FIRST' : (decision.warningLevel === 'exceeded' ? 'Pay Anyway' : 'Pay')}
          variant={isUnknown ? 'outline' : (decision.warningLevel === 'exceeded' ? 'danger' : 'primary')}
          size="lg"
          onPress={handlePay}
          disabled={isUnknown}
          icon={!isUnknown
            ? (decision.warningLevel === 'exceeded'
              ? <AlertTriangle size={20} color="#DFFF00" strokeWidth={2.5} />
              : <CheckCircle size={20} color={Colors.white} strokeWidth={2.5} />)
            : undefined}
        />
        <View style={{ height: Spacing.md }} />
        <NeoButton
          title="Cancel"
          variant="outline"
          size="lg"
          onPress={handleCancel}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  scroll: { flex: 1 },
  content: { paddingHorizontal: Spacing.lg },
  header: { paddingVertical: Spacing.md },
  headerLabel: {
    fontFamily: Fonts.display, fontSize: FontSizes.md,
    color: Colors.textSecondary, textAlign: 'center',
  },
  amountSection: { alignItems: 'center', paddingVertical: Spacing.xl },
  amount: {
    fontFamily: Fonts.display, fontSize: FontSizes.hero,
    color: Colors.white, fontWeight: '700',
  },
  merchant: {
    fontFamily: Fonts.display, fontSize: FontSizes.xl,
    color: Colors.textSecondary, marginTop: Spacing.xs,
  },
  note: {
    fontFamily: Fonts.display, fontSize: FontSizes.md,
    color: Colors.textMuted, marginTop: Spacing.xs,
  },
  categorySection: { marginBottom: Spacing.xl },
  categoryLabel: {
    fontFamily: Fonts.display, fontSize: FontSizes.sm,
    color: Colors.textMuted, letterSpacing: 2, marginBottom: Spacing.sm,
  },
  chipGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 12, paddingVertical: 8,
    borderWidth: 2, borderRadius: Radii.pill,
  },
  chipText: { fontFamily: Fonts.display, fontSize: FontSizes.sm },
  totalImpact: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: Spacing.md, borderTopWidth: 1, borderTopColor: Colors.border,
  },
  totalLabel: {
    fontFamily: Fonts.display, fontSize: FontSizes.md, color: Colors.textSecondary,
  },
  totalValue: {
    fontFamily: Fonts.display, fontSize: FontSizes.lg,
    color: Colors.white, fontWeight: '700',
  },
  actions: {
    paddingHorizontal: Spacing.lg, paddingTop: Spacing.md,
    borderTopWidth: 1, borderTopColor: Colors.border,
  },
  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: Spacing.lg },
  emptyText: {
    fontFamily: Fonts.display, fontSize: FontSizes.xl, color: Colors.textSecondary,
  },
});
