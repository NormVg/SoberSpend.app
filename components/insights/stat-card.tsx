import { NeoCard } from '@/components/ui/neo-card';
import { Colors, Fonts, FontSizes, Spacing } from '@/constants/theme';
import React from 'react';
import { StyleSheet, Text } from 'react-native';

interface StatCardProps {
  title: string;
  value: string;
  color?: string;
  subtitle?: string;
}

export function StatCard({ title, value, color = Colors.yellow, subtitle }: StatCardProps) {
  return (
    <NeoCard color={color}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.value}>{value}</Text>
      {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
    </NeoCard>
  );
}

const styles = StyleSheet.create({
  title: {
    fontFamily: Fonts.display,
    fontSize: FontSizes.sm,
    color: Colors.black,
    marginBottom: Spacing.xs,
    opacity: 0.7,
  },
  value: {
    fontFamily: Fonts.display,
    fontSize: FontSizes.xxl,
    color: Colors.black,
    fontWeight: '700',
  },
  subtitle: {
    fontFamily: Fonts.display,
    fontSize: FontSizes.sm,
    color: Colors.black,
    marginTop: Spacing.xs,
    opacity: 0.6,
  },
});
