import { NeoButton } from '@/components/ui/neo-button';
import { NeoCard } from '@/components/ui/neo-card';
import { Borders, Colors, Fonts, FontSizes, Radii, Spacing } from '@/constants/theme';
import { useBudgetStore } from '@/store/budget-store';
import { useExpenseStore } from '@/store/expense-store';
import { currentMonthExpenses, spentByCategory } from '@/utils/budget-engine';
import { formatCurrency } from '@/utils/format';
import { useRouter } from 'expo-router';
import { Car, Circle, CircleEllipsis, Film, Gamepad2, ShoppingBag, ShoppingCart, Target, Utensils, Zap } from 'lucide-react-native';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

const iconMap: Record<string, any> = {
  'utensils': Utensils, 'car': Car, 'shopping-bag': ShoppingBag,
  'film': Film, 'zap': Zap, 'circle-ellipsis': CircleEllipsis,
  'shopping-cart': ShoppingCart, 'gamepad-2': Gamepad2, 'target': Target
};

export function HardTruthCard() {
  const router = useRouter();
  const expenses = useExpenseStore(s => s.expenses);
  const categories = useBudgetStore(s => s.categories);

  const currentSpent = currentMonthExpenses(expenses);
  const spendMap = spentByCategory(currentSpent);

  const truthData = Object.entries(spendMap)
    .filter(([, amount]) => amount > 0)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3)
    .map(([catId, amount], idx) => {
      const cat = categories.find(c => c.id === catId);
      return {
        id: catId,
        name: cat?.name || 'OTHER',
        icon: iconMap[cat?.icon || 'circle-ellipsis'] || Circle,
        color: cat?.color || '#333',
        spent: formatCurrency(amount),
        trend: idx === 0 ? 'HIGHEST LEAK' : (idx === 1 ? 'SECOND HIGHEST' : 'KEEP AN EYE ON IT'),
        trendColor: idx === 0 ? '#FF1A1A' : (idx === 1 ? '#FF85A2' : Colors.black),
      }
    });

  return (
    <NeoCard style={styles.card} color={Colors.white} offset={true}>
      <Text style={styles.title}>THE HARD TRUTH</Text>

      {truthData.length === 0 ? (
        <Text style={[styles.description, { marginBottom: Spacing.lg }]}>No expenses this month. Your wallet is safe for now.</Text>
      ) : (
        <View style={styles.list}>
          {truthData.map((item, index) => {
            const isLast = index === truthData.length - 1;
            const Icon = item.icon;

            return (
              <View key={item.id} style={[styles.row, !isLast && styles.rowBorder]}>
                <View style={styles.left}>
                  <View style={[styles.iconBox, { backgroundColor: item.color }]}>
                    <Icon size={16} color={Colors.black} strokeWidth={2.5} />
                  </View>
                  <Text style={styles.name}>{item.name}</Text>
                </View>

                <View style={styles.right}>
                  <Text style={styles.spent}>{item.spent}</Text>
                  <Text style={[styles.trend, { color: item.trendColor }]}>{item.trend}</Text>
                </View>
              </View>
            );
          })}
        </View>
      )}

      <View style={styles.buttonContainer}>
        <NeoButton
          title="VIEW ALL TRANSACTIONS"
          variant="primary"
          style={{ backgroundColor: Colors.black }}
          textStyle={{ color: Colors.white }}
          onPress={() => router.push('/transactions' as any)}
        />
      </View>
    </NeoCard>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: Spacing.xxl,
  },
  title: {
    fontFamily: Fonts.display,
    fontSize: 24,
    color: Colors.black,
    lineHeight: 24,
    marginBottom: Spacing.md,
  },
  description: {
    fontFamily: Fonts.display,
    fontSize: FontSizes.md,
    color: Colors.textSecondary,
  },
  list: {
    marginBottom: Spacing.lg,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
  },
  rowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
    borderStyle: 'dashed',
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconBox: {
    width: 32,
    height: 32,
    borderRadius: Radii.sm,
    borderWidth: Borders.thin,
    borderColor: Colors.black,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  name: {
    fontFamily: Fonts.display,
    fontSize: FontSizes.sm,
    color: Colors.black,
    fontWeight: '700',
  },
  right: {
    alignItems: 'flex-end',
  },
  spent: {
    fontFamily: Fonts.display,
    fontSize: FontSizes.md,
    color: Colors.black,
    fontWeight: '700',
    marginBottom: 2,
  },
  trend: {
    fontFamily: Fonts.display,
    fontSize: 8,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  buttonContainer: {
    marginTop: Spacing.xs,
  },
});
