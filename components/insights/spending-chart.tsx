import { Borders, Colors, Fonts, FontSizes, Radii, Spacing } from '@/constants/theme';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface SpendingChartProps {
  data: { label: string; value: number }[];
  height?: number;
}

export function SpendingChart({ data, height = 180 }: SpendingChartProps) {
  const maxValue = Math.max(...data.map((d) => d.value), 1);
  const barWidth = 32;
  const gap = 16;
  const chartWidth = data.length * (barWidth + gap);
  const containerHeight = height + 30; // 30px for labels

  return (
    <View style={styles.container}>
      <View style={[styles.chartArea, { height: containerHeight, width: chartWidth }]}>
        {data.map((item, i) => {
          const barHeight = (item.value / maxValue) * height;
          const x = i * (barWidth + gap);

          return (
            <View
              key={`bar-${item.label}`}
              style={[
                styles.bar,
                {
                  height: barHeight,
                  width: barWidth,
                  left: x,
                  bottom: 30, // space for label
                },
              ]}
            />
          );
        })}

        {/* Labels */}
        {data.map((item, i) => {
          const x = i * (barWidth + gap);
          return (
            <Text
              key={`label-${item.label}`}
              style={[
                styles.label,
                {
                  width: barWidth + gap,
                  left: x - (gap / 2),
                  bottom: 0,
                },
              ]}
              numberOfLines={1}
            >
              {item.label}
            </Text>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.surface,
    borderWidth: Borders.medium,
    borderColor: Colors.border,
    borderRadius: Radii.md,
    padding: Spacing.md,
    alignItems: 'center', // Center the chart if fewer items
  },
  chartArea: {
    position: 'relative',
  },
  bar: {
    position: 'absolute',
    backgroundColor: Colors.accent,
    borderWidth: 2,
    borderColor: Colors.border,
    borderRadius: 6,
  },
  label: {
    position: 'absolute',
    fontFamily: Fonts.display,
    fontSize: FontSizes.xs,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
});
