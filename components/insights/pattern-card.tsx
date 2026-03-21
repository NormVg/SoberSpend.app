import { NeoCard } from '@/components/ui/neo-card';
import { Colors, Fonts, FontSizes, Radii, Spacing } from '@/constants/theme';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export function PatternCard() {
  const bars = [10, 15, 20, 15, 70, 80, 65]; // Mon - Sun

  return (
    <NeoCard style={styles.card} color="#FF85A2" offset={true}>
      <View style={styles.badge}>
        <Text style={styles.badgeText}>PATTERN DETECTED</Text>
      </View>

      <Text style={styles.title}>WEEKEND OVERSPENDER</Text>
      <Text style={styles.description}>Your spending spikes 240% every Friday after 6PM.</Text>

      <View style={styles.chart}>
        {bars.map((height, i) => (
          <View
            key={i}
            style={[
              styles.bar,
              { height: `${height}%`, opacity: height > 50 ? 1 : 0.4 }
            ]}
          />
        ))}
      </View>
    </NeoCard>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: Spacing.md,
  },
  badge: {
    backgroundColor: Colors.black,
    alignSelf: 'flex-start',
    paddingHorizontal: Spacing.md,
    paddingVertical: 4,
    borderRadius: Radii.pill,
    marginBottom: Spacing.md,
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
    fontSize: 40,
    color: Colors.black,
    lineHeight: 40,
    textTransform: 'uppercase',
    marginBottom: Spacing.sm,
  },
  description: {
    fontFamily: Fonts.display,
    fontSize: FontSizes.md,
    color: Colors.black,
    marginBottom: Spacing.xl,
  },
  chart: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: 80,
    marginTop: Spacing.sm,
    gap: 4,
  },
  bar: {
    flex: 1,
    backgroundColor: Colors.black,
    borderRadius: 2,
  },
});
