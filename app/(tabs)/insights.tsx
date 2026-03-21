import { CriticalWindowCard } from '@/components/insights/critical-window-card';
import { HardTruthCard } from '@/components/insights/hard-truth-card';
import { PatternCard } from '@/components/insights/pattern-card';
import { SavingsGoalCard } from '@/components/insights/savings-goal-card';
import { SpendingTrendsCard } from '@/components/insights/spending-trends-card';
import { WarningBanner } from '@/components/insights/warning-banner';
import { Colors, Fonts, FontSizes, Spacing } from '@/constants/theme';
import { Bell } from 'lucide-react-native';
import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function InsightsScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Sober.Spend</Text>
          <Bell size={24} color={Colors.white} />
        </View>

        <WarningBanner message="YOU'VE SPENT 30% MORE ON FOOD THIS WEEK COMPARED TO LAST." />
        <PatternCard />
        <CriticalWindowCard />
        <SpendingTrendsCard />

        <Text style={styles.sectionHeading}>TIME TO SAVE</Text>

        <SavingsGoalCard
          title="NEW LAPTOP"
          price="$1,200.00"
          daysLeft={14}
          subtitle="Based on current spending habits."
          color="#DFFF00"
          icon="laptop"
          progressPercent={60}
        />
        <SavingsGoalCard
          title="TOKYO TRIP"
          price="$2,500.00"
          daysLeft={82}
          subtitle="Stop Friday bars to save 12 days."
          color="#00FFFF"
          icon="plane"
          progressPercent={20}
        />

        <HardTruthCard />

        {/* Bottom Spacer for Nav */}
        <View style={{ height: 130 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111',
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: Spacing.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  headerTitle: {
    fontFamily: Fonts.display,
    fontSize: FontSizes.xxl,
    color: Colors.white,
    fontWeight: '700',
  },
  sectionHeading: {
    fontFamily: Fonts.display,
    fontSize: 28,
    color: '#DFFF00',
    textTransform: 'uppercase',
    fontStyle: 'italic',
    marginTop: Spacing.lg,
    marginBottom: Spacing.md,
  },
});
