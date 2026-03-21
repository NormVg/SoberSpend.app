import { NeoCard } from '@/components/ui/neo-card';
import { Colors, Fonts, Radii, Spacing } from '@/constants/theme';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export function SpendingTrendsCard() {
  const bars = [
    { label: 'MON', height: 40, color: '#00FFFF' },
    { label: 'TUE', height: 70, color: '#DFFF00' },
    { label: 'WED', height: 50, color: '#00FFFF' },
    { label: 'THU', height: 90, color: '#FF85A2' },
    { label: 'FRI', height: 60, color: '#DFFF00' },
  ];

  return (
    <NeoCard style={styles.card} color="#1A1A1A" offset={false}>
      <View style={styles.header}>
        <Text style={styles.title}>SPENDING{'\n'}TRENDS</Text>

        <View style={styles.toggleGroup}>
          <View style={[styles.togglePill, styles.toggleActive]}>
            <Text style={styles.toggleTextActive}>WEEKLY</Text>
          </View>
          <View style={[styles.togglePill, styles.toggleInactive]}>
            <Text style={styles.toggleTextInactive}>MONTHLY</Text>
          </View>
        </View>
      </View>

      <View style={styles.chartArea}>
        {/* Y Axis Line */}
        <View style={styles.yAxis} />
        {/* X Axis Line */}
        <View style={styles.xAxis} />

        <View style={styles.barsContainer}>
          {bars.map((bar, i) => (
            <View key={i} style={styles.barCol}>
              <View style={[styles.bar, { height: `${bar.height}%`, backgroundColor: bar.color }]} />
              <Text style={styles.barLabel}>{bar.label}</Text>
            </View>
          ))}
        </View>
      </View>
    </NeoCard>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: Spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  title: {
    fontFamily: Fonts.display,
    fontSize: 24,
    color: Colors.white,
    textTransform: 'uppercase',
    lineHeight: 24,
  },
  toggleGroup: {
    flexDirection: 'row',
    gap: 4,
  },
  togglePill: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 6,
    borderRadius: Radii.sm,
    borderWidth: 2,
    borderColor: Colors.black,
  },
  toggleActive: {
    backgroundColor: '#DFFF00',
  },
  toggleInactive: {
    backgroundColor: '#333',
    borderColor: '#222',
  },
  toggleTextActive: {
    fontFamily: Fonts.display,
    fontSize: 10,
    color: Colors.black,
  },
  toggleTextInactive: {
    fontFamily: Fonts.display,
    fontSize: 10,
    color: '#888',
  },
  chartArea: {
    height: 180,
    marginTop: Spacing.xl,
    position: 'relative',
    paddingBottom: 24, // Space for labels
    paddingLeft: Spacing.sm,
  },
  yAxis: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 24,
    width: 2,
    backgroundColor: '#333',
  },
  xAxis: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 24,
    height: 2,
    backgroundColor: '#333',
  },
  barsContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingHorizontal: Spacing.md,
  },
  barCol: {
    alignItems: 'center',
    height: '100%',
    justifyContent: 'flex-end',
  },
  bar: {
    width: 20,
    borderWidth: 2,
    borderColor: Colors.black,
    borderRadius: 2,
    marginBottom: 4,
  },
  barLabel: {
    fontFamily: Fonts.display,
    fontSize: 10,
    color: '#888',
    position: 'absolute',
    bottom: -20,
  },
});
