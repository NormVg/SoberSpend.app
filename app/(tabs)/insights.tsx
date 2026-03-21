import { CriticalWindowCard } from '@/components/insights/critical-window-card';
import { HardTruthCard } from '@/components/insights/hard-truth-card';
import { PatternCard } from '@/components/insights/pattern-card';
import { SavingsGoalCard } from '@/components/insights/savings-goal-card';
import { SpendingTrendsCard } from '@/components/insights/spending-trends-card';
import { WarningBanner } from '@/components/insights/warning-banner';
import { NeoCard } from '@/components/ui/neo-card';
import { Colors, Fonts, FontSizes, Spacing } from '@/constants/theme';
import { useBudgetStore } from '@/store/budget-store';
import { useExpenseStore } from '@/store/expense-store';
import { useWishlistStore } from '@/store/wishlist-store';
import { currentMonthExpenses, totalSpent } from '@/utils/budget-engine';
import { formatCurrency } from '@/utils/format';
import { useRouter } from 'expo-router';
import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function InsightsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const wishlists = useWishlistStore((s) => s.items);
  const expenses = useExpenseStore((s) => s.expenses);
  const budget = useBudgetStore((s) => s.monthlyBudget);

  const currentSpent = totalSpent(currentMonthExpenses(expenses));
  let warningMessage = '';

  if (currentSpent > budget * 0.9 && budget > 0) {
    warningMessage = `YOU'VE SPENT ${Math.round((currentSpent / budget) * 100)}% OF YOUR BUDGET ALREADY. SLOW DOWN.`;
  } else if (currentSpent > budget * 0.5 && budget > 0) {
    warningMessage = "HALFWAY THROUGH YOUR BUDGET. KEEP YOUR EYES OPEN.";
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.headerTitle}>
            Sober.<Text style={{ color: '#00FFFF' }}>Insights</Text>
          </Text>
          <Pressable
            onPress={() => router.push('/wrapped' as any)}
            style={styles.wrappedBtn}
          >
            <Text style={styles.wrappedBtnText}>✦ WRAPPED</Text>
          </Pressable>
        </View>

        {warningMessage ? (
          <WarningBanner message={warningMessage} />
        ) : null}

        <PatternCard />
        <CriticalWindowCard />
        <SpendingTrendsCard />

        <Text style={styles.sectionHeading}>TIME TO SAVE</Text>

        {wishlists.length === 0 ? (
          <NeoCard color="#333">
            <Text style={{ fontFamily: Fonts.display, color: Colors.white }}>No savings goals yet. Add them in the Wishlist tab.</Text>
          </NeoCard>
        ) : (
          wishlists.map((item, i) => {
            const colors = ['#DFFF00', '#00FFFF', '#FF85A2'];
            const color = colors[i % colors.length];
            // Basic proxy for savings left: just guess based on budget vs spent
            const monthlySavings = useBudgetStore.getState().monthlySavingsTarget || 1;
            const monthsNeeded = Math.ceil(item.price / monthlySavings);
            const daysLeft = monthsNeeded * 30;
            const progress = Math.min((1 / monthsNeeded) * 100, 100) || 5;

            return (
              <SavingsGoalCard
                key={item.id}
                title={item.name}
                price={formatCurrency(item.price)}
                daysLeft={daysLeft}
                subtitle={`Based on your ₹${monthlySavings}/mo savings target.`}
                color={color}
                icon="target"
                progressPercent={progress}
              />
            );
          })
        )}

        <HardTruthCard />

        {/* Bottom Spacer for Nav */}
        <View style={{ height: 130 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111',
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: Spacing.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: Spacing.md,
    paddingBottom: Spacing.xs,
    marginBottom: Spacing.sm,
  },
  headerTitle: {
    fontFamily: Fonts.display,
    fontSize: FontSizes.xxl,
    color: Colors.white,
    fontWeight: '700',
  },
  sectionHeading: {
    fontFamily: Fonts.display,
    fontSize: 28,
    color: '#DFFF00',
    textTransform: 'uppercase',
    fontStyle: 'italic',
    marginTop: Spacing.lg,
    marginBottom: Spacing.md,
  },
  wrappedBtn: {
    backgroundColor: Colors.accent,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: 999,
    borderWidth: 3,
    borderColor: Colors.black,
  },
  wrappedBtnText: {
    fontFamily: Fonts.display,
    fontSize: FontSizes.sm,
    color: Colors.white,
    letterSpacing: 2,
  },
});
