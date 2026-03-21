import { BudgetImpact } from '@/components/decision/budget-impact';
import { WarningBanner } from '@/components/decision/warning-banner';
import { NeoButton } from '@/components/ui/neo-button';
import { Colors, Fonts, FontSizes, Spacing } from '@/constants/theme';
import { useBudgetStore } from '@/store/budget-store';
import { useExpenseStore } from '@/store/expense-store';
import { currentMonthExpenses } from '@/utils/budget-engine';
import { evaluateTransaction } from '@/utils/decision-engine';
import { formatCurrency } from '@/utils/format';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function DecisionScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const pendingTransaction = useExpenseStore((s) => s.pendingTransaction);
  const confirmPending = useExpenseStore((s) => s.confirmPendingTransaction);
  const setPending = useExpenseStore((s) => s.setPendingTransaction);
  const expenses = useExpenseStore((s) => s.expenses);
  const { monthlyBudget, categories } = useBudgetStore();

  // If no pending transaction, go back
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

  const category = categories.find((c) => c.id === pendingTransaction.category);
  if (!category) {
    router.back();
    return null;
  }

  const monthExpenses = currentMonthExpenses(expenses);
  const decision = evaluateTransaction(
    pendingTransaction.merchant,
    pendingTransaction.amount,
    category,
    monthExpenses,
    monthlyBudget
  );

  const handlePay = () => {
    Haptics.notificationAsync(
      decision.warningLevel === 'exceeded'
        ? Haptics.NotificationFeedbackType.Warning
        : Haptics.NotificationFeedbackType.Success
    );
    confirmPending();
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

        {/* Budget Impact */}
        <View style={{ marginBottom: Spacing.lg }}>
          <BudgetImpact
            category={category}
            currentSpent={decision.currentSpent}
            currentPercent={decision.currentPercent}
            projectedSpent={decision.projectedSpent}
            projectedPercent={decision.projectedPercent}
          />
        </View>

        {/* Warning */}
        <View style={{ marginBottom: Spacing.xl }}>
          <WarningBanner
            level={decision.warningLevel}
            message={decision.warningMessage}
          />
        </View>

        {/* Total Budget Impact */}
        <View style={styles.totalImpact}>
          <Text style={styles.totalLabel}>Total Monthly Budget</Text>
          <Text style={styles.totalValue}>
            {decision.totalCurrentPercent}% → {decision.totalProjectedPercent}%
          </Text>
        </View>
      </ScrollView>

      {/* Action Buttons */}
      <View style={[styles.actions, { paddingBottom: insets.bottom + Spacing.md }]}>
        <NeoButton
          title={decision.warningLevel === 'exceeded' ? 'Pay Anyway ⚠️' : 'Pay'}
          variant={decision.warningLevel === 'exceeded' ? 'danger' : 'primary'}
          size="lg"
          onPress={handlePay}
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
  container: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: Spacing.lg,
  },
  header: {
    paddingVertical: Spacing.md,
  },
  headerLabel: {
    fontFamily: Fonts.display,
    fontSize: FontSizes.md,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  amountSection: {
    alignItems: 'center',
    paddingVertical: Spacing.xl,
  },
  amount: {
    fontFamily: Fonts.display,
    fontSize: FontSizes.hero,
    color: Colors.white,
    fontWeight: '700',
  },
  merchant: {
    fontFamily: Fonts.display,
    fontSize: FontSizes.xl,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
  },
  note: {
    fontFamily: Fonts.display,
    fontSize: FontSizes.md,
    color: Colors.textMuted,
    marginTop: Spacing.xs,
  },
  totalImpact: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  totalLabel: {
    fontFamily: Fonts.display,
    fontSize: FontSizes.md,
    color: Colors.textSecondary,
  },
  totalValue: {
    fontFamily: Fonts.display,
    fontSize: FontSizes.lg,
    color: Colors.white,
    fontWeight: '700',
  },
  actions: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    borderTopWidth: Spacing.xs,
    borderTopColor: Colors.border,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.lg,
  },
  emptyText: {
    fontFamily: Fonts.display,
    fontSize: FontSizes.xl,
    color: Colors.textSecondary,
  },
});
