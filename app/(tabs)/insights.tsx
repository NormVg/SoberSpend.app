import { SpendingChart } from '@/components/insights/spending-chart';
import { StatCard } from '@/components/insights/stat-card';
import { Colors, Fonts, FontSizes, Spacing } from '@/constants/theme';
import { useBudgetStore } from '@/store/budget-store';
import { useExpenseStore } from '@/store/expense-store';
import { currentMonthExpenses, dailyAverage, spentByCategory, totalSpent } from '@/utils/budget-engine';
import { formatCurrency } from '@/utils/format';
import React, { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function InsightsScreen() {
  const insets = useSafeAreaInsets();
  const expenses = useExpenseStore((s) => s.expenses);
  const { categories, monthlyBudget } = useBudgetStore();

  const monthExpenses = currentMonthExpenses(expenses);
  const total = totalSpent(monthExpenses);
  const byCat = spentByCategory(monthExpenses);
  const avgDaily = dailyAverage(monthExpenses);

  // Find top spending category
  const topCategory = useMemo(() => {
    let maxId = '';
    let maxVal = 0;
    for (const [id, val] of Object.entries(byCat)) {
      if (val > maxVal) {
        maxId = id;
        maxVal = val;
      }
    }
    return categories.find((c) => c.id === maxId);
  }, [byCat, categories]);

  // Weekly comparison (simple: compare last 7d vs prev 7d)
  const weeklyChange = useMemo(() => {
    const now = Date.now();
    const oneWeek = 7 * 24 * 60 * 60 * 1000;
    const thisWeek = expenses.filter((e) => now - new Date(e.date).getTime() < oneWeek);
    const lastWeek = expenses.filter((e) => {
      const diff = now - new Date(e.date).getTime();
      return diff >= oneWeek && diff < oneWeek * 2;
    });
    const thisTotal = totalSpent(thisWeek);
    const lastTotal = totalSpent(lastWeek);
    if (lastTotal === 0) return 0;
    return Math.round(((thisTotal - lastTotal) / lastTotal) * 100);
  }, [expenses]);

  // Chart data: spending by category
  const chartData = useMemo(() => {
    return categories
      .filter((c) => (byCat[c.id] || 0) > 0)
      .map((c) => ({ label: c.name.slice(0, 4), value: byCat[c.id] || 0 }));
  }, [byCat, categories]);

  const budgetUsedPercent = monthlyBudget > 0 ? Math.round((total / monthlyBudget) * 100) : 0;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Insights</Text>

        {/* Stat Cards */}
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <StatCard
              title="Weekly Change"
              value={`${weeklyChange >= 0 ? '+' : ''}${weeklyChange}%`}
              color={weeklyChange > 0 ? Colors.nearLimit : Colors.safe}
              subtitle={weeklyChange > 0 ? 'spending more' : 'spending less'}
            />
          </View>
          <View style={styles.statItem}>
            <StatCard
              title="Top Category"
              value={topCategory?.name || '—'}
              color={Colors.purple}
              subtitle={topCategory ? formatCurrency(byCat[topCategory.id] || 0) : undefined}
            />
          </View>
        </View>

        <View style={[styles.statsRow, { marginTop: Spacing.md }]}>
          <View style={styles.statItem}>
            <StatCard
              title="Daily Average"
              value={formatCurrency(avgDaily)}
              color={Colors.orange}
              subtitle="per day"
            />
          </View>
          <View style={styles.statItem}>
            <StatCard
              title="Budget Used"
              value={`${budgetUsedPercent}%`}
              color={budgetUsedPercent >= 80 ? Colors.exceeded : Colors.mint}
              subtitle={formatCurrency(total)}
            />
          </View>
        </View>

        {/* Spending Chart */}
        <Text style={[styles.sectionTitle, { marginTop: Spacing.xl }]}>By Category</Text>
        {chartData.length > 0 ? (
          <SpendingChart data={chartData} />
        ) : (
          <Text style={styles.empty}>No data yet</Text>
        )}

        {/* Category Breakdown */}
        <Text style={[styles.sectionTitle, { marginTop: Spacing.xl }]}>Breakdown</Text>
        {categories.map((cat) => {
          const spent = byCat[cat.id] || 0;
          if (spent === 0) return null;
          const pct = cat.budgetLimit > 0 ? Math.round((spent / cat.budgetLimit) * 100) : 0;
          return (
            <View key={cat.id} style={styles.breakdownRow}>
              <View style={[styles.dot, { backgroundColor: cat.color }]} />
              <Text style={styles.breakdownName}>{cat.name}</Text>
              <Text style={styles.breakdownAmount}>{formatCurrency(spent)}</Text>
              <Text style={styles.breakdownPct}>{pct}%</Text>
            </View>
          );
        })}

        {/* Bottom Spacer for Nav */}
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
  title: {
    fontFamily: Fonts.display,
    fontSize: FontSizes.xxl,
    color: Colors.white,
    fontWeight: '700',
    paddingVertical: Spacing.lg,
  },
  statsRow: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  statItem: {
    flex: 1,
  },
  sectionTitle: {
    fontFamily: Fonts.display,
    fontSize: FontSizes.lg,
    color: Colors.textSecondary,
    marginBottom: Spacing.md,
  },
  empty: {
    fontFamily: Fonts.display,
    fontSize: FontSizes.md,
    color: Colors.textMuted,
    textAlign: 'center',
    paddingVertical: Spacing.xl,
  },
  breakdownRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    gap: Spacing.sm,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: Colors.black,
  },
  breakdownName: {
    flex: 1,
    fontFamily: Fonts.display,
    fontSize: FontSizes.md,
    color: Colors.white,
  },
  breakdownAmount: {
    fontFamily: Fonts.display,
    fontSize: FontSizes.md,
    color: Colors.white,
    fontWeight: '700',
  },
  breakdownPct: {
    fontFamily: Fonts.display,
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
    width: 40,
    textAlign: 'right',
  },
});
