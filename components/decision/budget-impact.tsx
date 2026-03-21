import { NeoCard } from '@/components/ui/neo-card';
import { ProgressBar } from '@/components/ui/progress-bar';
import { Colors, Fonts, FontSizes, Spacing } from '@/constants/theme';
import type { Category } from '@/types';
import { formatCurrency, formatPercent } from '@/utils/format';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface BudgetImpactProps {
  category: Category;
  currentSpent: number;
  currentPercent: number;
  projectedSpent: number;
  projectedPercent: number;
}

export function BudgetImpact({
  category,
  currentSpent,
  currentPercent,
  projectedSpent,
  projectedPercent,
}: BudgetImpactProps) {
  return (
    <NeoCard color={category.color}>
      <Text style={styles.title}>{category.name} Budget</Text>

      <View style={styles.row}>
        <Text style={styles.label}>Current</Text>
        <Text style={styles.value}>{formatPercent(currentPercent)}</Text>
      </View>
      <ProgressBar
        percent={currentPercent}
        height={12}
        backgroundColor="rgba(0,0,0,0.15)"
        color={Colors.black}
        showBorder={false}
      />

      <View style={[styles.row, { marginTop: Spacing.md }]}>
        <Text style={styles.label}>After this</Text>
        <Text style={[styles.value, projectedPercent >= 90 && styles.danger]}>
          {formatPercent(projectedPercent)}
        </Text>
      </View>
      <ProgressBar
        percent={projectedPercent}
        height={12}
        backgroundColor="rgba(0,0,0,0.15)"
        color={projectedPercent >= 90 ? Colors.exceeded : projectedPercent >= 70 ? '#cc7700' : Colors.black}
        showBorder={false}
      />

      <View style={[styles.row, { marginTop: Spacing.md }]}>
        <Text style={styles.spent}>{formatCurrency(currentSpent)} → {formatCurrency(projectedSpent)}</Text>
        <Text style={styles.limit}>/ {formatCurrency(category.budgetLimit)}</Text>
      </View>
    </NeoCard>
  );
}

const styles = StyleSheet.create({
  title: {
    fontFamily: Fonts.display,
    fontSize: FontSizes.xl,
    color: Colors.black,
    fontWeight: '700',
    marginBottom: Spacing.md,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  label: {
    fontFamily: Fonts.display,
    fontSize: FontSizes.md,
    color: Colors.black,
  },
  value: {
    fontFamily: Fonts.display,
    fontSize: FontSizes.lg,
    color: Colors.black,
    fontWeight: '700',
  },
  danger: {
    color: '#8B0000',
  },
  spent: {
    fontFamily: Fonts.display,
    fontSize: FontSizes.sm,
    color: Colors.black,
    fontWeight: '600',
  },
  limit: {
    fontFamily: Fonts.display,
    fontSize: FontSizes.sm,
    color: 'rgba(0,0,0,0.5)',
  },
});
