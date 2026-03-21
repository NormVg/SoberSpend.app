import { NeoCard } from '@/components/ui/neo-card';
import { Colors, Fonts, FontSizes, Radii, Spacing } from '@/constants/theme';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { useExpenseStore } from '@/store/expense-store';
import { getCriticalWindow } from '@/utils/insights-engine';

export function CriticalWindowCard() {
  const expenses = useExpenseStore(s => s.expenses);
  const window = getCriticalWindow(expenses);

  return (
    <NeoCard style={styles.card} color="#00FFFF" offset={true}>
      <View style={styles.badgeContainer}>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>CRITICAL WINDOW</Text>
        </View>
      </View>

      <Text style={styles.title}>PEAK SPEND TIME:</Text>
      <Text style={styles.time}>{window.time}</Text>

      <Text style={styles.subtitle}>{window.subtitle}</Text>
    </NeoCard>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: Spacing.md,
    width: '100%',
  },
  badgeContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  badge: {
    backgroundColor: Colors.black,
    paddingHorizontal: Spacing.md,
    paddingVertical: 4,
    borderRadius: Radii.pill,
  },
  badgeText: {
    fontFamily: Fonts.display,
    fontSize: FontSizes.xs,
    color: Colors.white,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  title: {
    fontFamily: Fonts.display,
    fontSize: FontSizes.xl,
    color: Colors.black,
    textTransform: 'uppercase',
    marginTop: Spacing.sm,
    textAlign: 'center',
  },
  time: {
    fontFamily: Fonts.display,
    fontSize: 84,
    lineHeight: 84,
    color: Colors.black,
    textAlign: 'center',
  },
  subtitle: {
    fontFamily: Fonts.display,
    fontSize: FontSizes.sm,
    color: Colors.black,
    textAlign: 'center',
    marginTop: Spacing.xs,
    textTransform: 'uppercase',
  },
});
