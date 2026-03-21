import { NeoCard } from '@/components/ui/neo-card';
import { StatusBadge } from '@/components/ui/status-badge';
import { Colors, Fonts, FontSizes, Spacing } from '@/constants/theme';
import type { WarningLevel } from '@/types';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface WarningBannerProps {
  level: WarningLevel;
  message: string;
}

const bgMap: Record<WarningLevel, string> = {
  safe: Colors.safe,
  near_limit: Colors.nearLimit,
  exceeded: Colors.exceeded,
};

export function WarningBanner({ level, message }: WarningBannerProps) {
  return (
    <NeoCard color={bgMap[level]}>
      <View style={styles.row}>
        <StatusBadge level={level} size="sm" />
      </View>
      <Text style={styles.message}>{message}</Text>
    </NeoCard>
  );
}

const styles = StyleSheet.create({
  row: {
    marginBottom: Spacing.sm,
  },
  message: {
    fontFamily: Fonts.display,
    fontSize: FontSizes.md,
    color: Colors.black,
    fontWeight: '600',
    lineHeight: 22,
  },
});
