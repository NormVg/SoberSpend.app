import { NeoCard } from '@/components/ui/neo-card';
import { Borders, Colors, Fonts, FontSizes, Radii, Spacing } from '@/constants/theme';
import { formatCurrency } from '@/utils/format';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface BudgetSummaryProps {
  totalSpent: number;
  monthlyBudget: number;
}

export function BudgetSummary({ totalSpent, monthlyBudget }: BudgetSummaryProps) {
  const remaining = Math.max(0, monthlyBudget - totalSpent);
  const percentStr = monthlyBudget > 0 ? Math.min(100, Math.round((totalSpent / monthlyBudget) * 100)) : 0;

  return (
    <NeoCard style={styles.cardWrapper} color={Colors.surface} offset={true}>
      <View style={styles.contentPad}>
        <View style={styles.topRow}>
          <Text style={styles.label}>CURRENT STATUS</Text>
          <Text style={styles.label}>REMAINING</Text>
        </View>

        <View style={styles.middleRow}>
          <View>
            <Text style={styles.percentText}>{percentStr}%</Text>
            <Text style={styles.spentText}>SPENT</Text>
          </View>
          <Text style={styles.remainingAmount}>{formatCurrency(remaining)}</Text>
        </View>

        <View style={styles.barContainer}>
          <View style={styles.barBg}>
            <View style={[styles.barFill, { width: `${percentStr}%` }]} />
          </View>
        </View>

        <View style={styles.bottomRow}>
          <Text style={styles.zeroText}>{formatCurrency(0)}</Text>
          <Text style={styles.budgetText}>{formatCurrency(monthlyBudget)} BUDGET</Text>
        </View>
      </View>
    </NeoCard>
  );
}

const styles = StyleSheet.create({
  cardWrapper: {
    width: '100%',
  },
  contentPad: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  label: {
    fontFamily: Fonts.display,
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  middleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.xl,
  },
  percentText: {
    fontFamily: Fonts.display,
    fontSize: 76,
    color: Colors.accent,
    lineHeight: 76,
    marginLeft: -2,
  },
  spentText: {
    fontFamily: Fonts.display,
    fontSize: 54,
    color: Colors.accent,
    lineHeight: 54,
    marginTop: -16,
  },
  remainingAmount: {
    fontFamily: Fonts.display,
    fontSize: 32,
    color: Colors.white,
    marginTop: 4,
  },
  barContainer: {
    marginBottom: Spacing.md,
    marginTop: Spacing.sm,
  },
  barBg: {
    height: 44,
    backgroundColor: '#333333',
    borderRadius: Radii.pill,
    borderWidth: Borders.thick,
    borderColor: Colors.black,
    overflow: 'hidden',
    flexDirection: 'row',
  },
  barFill: {
    height: '100%',
    backgroundColor: Colors.accent,
    borderRightWidth: Borders.thick,
    borderColor: Colors.black,
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.xs,
  },
  zeroText: {
    fontFamily: Fonts.display,
    fontSize: FontSizes.sm,
    color: Colors.white,
    fontWeight: '700',
  },
  budgetText: {
    fontFamily: Fonts.display,
    fontSize: FontSizes.sm,
    color: Colors.accent,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
});
