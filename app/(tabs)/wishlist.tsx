import { SavingsGoalCard } from '@/components/insights/savings-goal-card';
import { Colors, Fonts, FontSizes, Spacing } from '@/constants/theme';
import { useBudgetStore } from '@/store/budget-store';
import { useExpenseStore } from '@/store/expense-store';
import { useWishlistStore } from '@/store/wishlist-store';
import { currentMonthExpenses, daysToAfford, totalSpent } from '@/utils/budget-engine';
import { formatCurrency } from '@/utils/format';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { Car, CircleEllipsis, Film, Plus, ShoppingBag, Utensils, Zap } from 'lucide-react-native';
import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const iconMap: Record<string, any> = {
  'utensils': Utensils,
  'car': Car,
  'shopping-bag': ShoppingBag,
  'film': Film,
  'zap': Zap,
  'circle-ellipsis': CircleEllipsis,
};

export default function WishlistScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { items, removeItem } = useWishlistStore();
  const expenses = useExpenseStore((s) => s.expenses);
  const monthlyBudget = useBudgetStore((s) => s.monthlyBudget);
  const monthlySavingsTarget = useBudgetStore((s) => s.monthlySavingsTarget);
  const categories = useBudgetStore((s) => s.categories);

  const monthExpenses = currentMonthExpenses(expenses);
  const spent = totalSpent(monthExpenses);

  const handleRemove = (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    removeItem(id);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.title}>
              Sober.<Text style={{ color: '#DFFF00' }}>Goals</Text>
            </Text>
            <Text style={styles.subtitle}>{items.length} item{items.length !== 1 ? 's' : ''} tracked</Text>
          </View>
        </View>

        {/* Wishlist Items */}
        {items.map((item, index) => {
          const days = daysToAfford(item.price, monthlyBudget, spent, monthlySavingsTarget);
          const isEven = index % 2 === 0;
          const cardColor = isEven ? '#FF85A2' : '#DFFF00';

          const savingsPerMonth = monthlySavingsTarget > 0 ? monthlySavingsTarget : Math.max(0, monthlyBudget - spent);
          const progressPercent = Math.min(100, Math.round((savingsPerMonth / item.price) * 100));

          const itemCategory = categories.find(c => c.id === item.categoryId);
          const iconString = itemCategory ? itemCategory.icon : undefined;

          return (
            <SavingsGoalCard
              key={item.id}
              title={item.name}
              price={formatCurrency(item.price)}
              daysLeft={days > 0 ? days : 0}
              subtitle={days < 0 ? "CAN'T AFFORD AT CURRENT RATE" : "BASED ON SAVINGS TARGET"}
              color={cardColor}
              icon={iconString}
              progressPercent={progressPercent}
              onDelete={() => handleRemove(item.id)}
            />
          );
        })}

        {/* Empty State */}
        {items.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>🎯</Text>
            <Text style={styles.emptyText}>No goals yet</Text>
            <Text style={styles.emptySubtext}>Tap + to add your first savings goal</Text>
          </View>
        )}

        <View style={{ height: 130 }} />
      </ScrollView>

      {/* Floating Add Button */}
      {/* FAB Shadow */}
      <View
        style={[
          styles.fab,
          { backgroundColor: Colors.white, right: Spacing.xl - 6, bottom: insets.bottom + 100 - 6, elevation: 0 },
        ]}
      />
      {/* FAB Main */}
      <Pressable
        style={[styles.fab, { bottom: insets.bottom + 100 }]}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          router.push('/add-goal');
        }}
      >
        <Plus size={32} color={Colors.black} strokeWidth={2.5} />
      </Pressable>
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
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: Spacing.lg,
  },
  title: {
    fontFamily: Fonts.display,
    fontSize: FontSizes.xxl,
    color: Colors.white,
    fontWeight: '700',
  },
  subtitle: {
    fontFamily: Fonts.display,
    fontSize: FontSizes.sm,
    color: Colors.textMuted,
    marginTop: 2,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: Spacing.xxl,
    marginTop: Spacing.xl,
  },
  emptyEmoji: {
    fontSize: 56,
    marginBottom: Spacing.md,
  },
  emptyText: {
    fontFamily: Fonts.display,
    fontSize: FontSizes.xl,
    color: Colors.textSecondary,
    fontWeight: '700',
  },
  emptySubtext: {
    fontFamily: Fonts.display,
    fontSize: FontSizes.md,
    color: Colors.textMuted,
    marginTop: Spacing.xs,
  },
  fab: {
    position: 'absolute',
    right: Spacing.xl,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#DFFF00',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: Colors.black,
  },
});
