import { Borders, Colors, Fonts, FontSizes, Radii, Spacing } from '@/constants/theme';
import type { WarningLevel } from '@/types';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface StatusBadgeProps {
  level: WarningLevel;
  size?: 'sm' | 'md';
}

const config: Record<WarningLevel, { label: string; bg: string; text: string }> = {
  safe: { label: 'Safe', bg: Colors.safe, text: Colors.black },
  near_limit: { label: 'Near Limit', bg: Colors.nearLimit, text: Colors.black },
  exceeded: { label: 'Exceeded', bg: Colors.exceeded, text: Colors.white },
};

export function StatusBadge({ level, size = 'md' }: StatusBadgeProps) {
  const { label, bg, text } = config[level];
  const isSmall = size === 'sm';

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: bg,
          paddingVertical: isSmall ? 3 : 6,
          paddingHorizontal: isSmall ? Spacing.sm : Spacing.md,
        },
      ]}
    >
      <Text
        style={[
          styles.text,
          {
            color: text,
            fontSize: isSmall ? FontSizes.xs : FontSizes.sm,
          },
        ]}
      >
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    borderWidth: Borders.thin,
    borderColor: Colors.black,
    borderRadius: Radii.pill,
    alignSelf: 'flex-start',
  },
  text: {
    fontFamily: Fonts.display,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});
