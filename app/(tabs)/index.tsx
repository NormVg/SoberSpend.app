import { BudgetSummary } from '@/components/dashboard/budget-summary';
import { CategoryCard } from '@/components/dashboard/category-card';
import { RiskBanner } from '@/components/dashboard/risk-banner';
import { TransactionItem } from '@/components/dashboard/transaction-item';
import { Colors, Fonts, FontSizes, Spacing } from '@/constants/theme';
import { useBudgetStore } from '@/store/budget-store';
import { useExpenseStore } from '@/store/expense-store';
import { currentMonthExpenses, spentByCategory, totalSpent } from '@/utils/budget-engine';
import { Link } from 'expo-router';
import { Settings } from 'lucide-react-native';
import React, { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function DashboardScreen() {
  const insets = useSafeAreaInsets();
  const expenses = useExpenseStore((s) => s.expenses);
  const { monthlyBudget, categories } = useBudgetStore();

  const monthExpenses = currentMonthExpenses(expenses);
  const total = totalSpent(monthExpenses);
  const byCat = spentByCategory(monthExpenses);
  const recent = monthExpenses.slice(0, 8);

  // Funny, highly reactive risk banner logic
  const riskProps = useMemo(() => {
    if (total === 0) return null;

    const totalPct = (total / monthlyBudget) * 100;

    if (totalPct >= 100) {
      return {
        riskLevel: 'BROKE' as any,
        message: 'Congratulations, you have officially spent all your money. Time to eat ice cubes for dinner.',
      };
    }
    if (totalPct >= 90) {
      return {
        riskLevel: 'DANGER' as any,
        message: "Bro you have basically nothing left for the month. Delete the app and pretend this isn't happening.",
      };
    }

    let maxId = '';
    let maxPct = 0;
    for (const [id, val] of Object.entries(byCat)) {
      const cat = categories.find((c) => c.id === id);
      if (cat && cat.budgetLimit > 0) {
        const pct = (val / cat.budgetLimit) * 100;
        if (pct > maxPct) { maxId = id; maxPct = pct; }
      }
    }
    const maxCat = categories.find((c) => c.id === maxId);

    if (!maxCat || maxPct < 20) {
      return {
        riskLevel: 'CHILL' as any,
        message: "You actually haven't ruined your finances yet. Rare.",
      }
    }

    if (maxPct >= 100) {
      return {
        riskLevel: 'WASTED' as any,
        message: `You blew your entire budget on ${maxCat.name}. Honestly, was it even worth it?`,
        highlightedWord: maxCat.name,
      }
    }
    if (maxPct >= 80) {
      return {
        riskLevel: 'WARNING' as any,
        message: `Chill out on ${maxCat.name}. You're basically funding their entire business this month.`,
        highlightedWord: maxCat.name,
      }
    }
    if (maxPct >= 50) {
      return {
        riskLevel: 'SUS' as any,
        message: `You're halfway through your ${maxCat.name} budget. Keep swiping, I dare you.`,
        highlightedWord: maxCat.name,
      }
    }

    return {
      riskLevel: 'SAFE' as any,
      message: `You've spent a little on ${maxCat.name}. Keep it cute.`,
      highlightedWord: maxCat.name,
    };
  }, [byCat, total, categories, monthlyBudget]);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Sober.Spend</Text>
          <Link href="/config" asChild>
            <Pressable style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}>
              <Settings size={28} color={Colors.white} />
            </Pressable>
          </Link>
        </View>

        {/* Budget Summary */}
        <BudgetSummary totalSpent={total} monthlyBudget={monthlyBudget} />

        {/* Risk Banner */}
        {riskProps && (
          <RiskBanner
            riskLevel={riskProps.riskLevel}
            message={riskProps.message}
            highlightedWord={riskProps.highlightedWord}
          />
        )}

        {/* Category Cards */}
        <Text style={styles.sectionTitle}>Budgets</Text>
        <View style={styles.categoryGrid}>
          {categories.map((cat) => (
            <View key={cat.id} style={styles.categoryItem}>
              <CategoryCard category={cat} spent={byCat[cat.id] || 0} />
            </View>
          ))}
        </View>

        {/* Recent Transactions */}
        <Text style={[styles.sectionTitle, { marginTop: Spacing.lg }]}>Recent</Text>
        <View style={styles.transactionsList}>
          {recent.map((expense) => {
            const cat = categories.find((c) => c.id === expense.category);
            return (
              <TransactionItem key={expense.id} expense={expense} category={cat} />
            );
          })}
          {recent.length === 0 && (
            <Text style={styles.empty}>No transactions yet</Text>
          )}
        </View>

        {/* Bottom spacer for floating navbar */}
        <View style={{ height: 130 }} />
      </ScrollView>
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Spacing.md,
    paddingBottom: Spacing.xs,
  },
  headerTitle: {
    fontFamily: Fonts.display,
    fontSize: FontSizes.xxl,
    color: Colors.white,
    fontWeight: '700',
  },
  sectionTitle: {
    fontFamily: Fonts.display,
    fontSize: FontSizes.lg,
    color: Colors.textSecondary,
    marginBottom: Spacing.md,
    marginTop: Spacing.sm,
  },
  categoryGrid: {
    gap: Spacing.md,
  },
  categoryItem: {
    // Each card takes full width
  },
  transactionsList: {
    marginBottom: Spacing.lg,
  },
  empty: {
    fontFamily: Fonts.display,
    fontSize: FontSizes.md,
    color: Colors.textMuted,
    textAlign: 'center',
    paddingVertical: Spacing.xl,
  },
});
