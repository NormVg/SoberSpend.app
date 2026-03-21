import { CriticalWindowCard } from '@/components/insights/critical-window-card';
import { HardTruthCard } from '@/components/insights/hard-truth-card';
import { PatternCard } from '@/components/insights/pattern-card';
import { SavingsGoalCard } from '@/components/insights/savings-goal-card';
import { SpendingTrendsCard } from '@/components/insights/spending-trends-card';
import { WarningBanner } from '@/components/insights/warning-banner';
import { Colors, Fonts, FontSizes, Spacing } from '@/constants/theme';
import { useRouter } from 'expo-router';
import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function InsightsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.headerTitle}>
            Sober.<Text style={{ color: '#00FFFF' }}>Insights</Text>
          </Text>
          <Pressable
            onPress={() => router.push('/wrapped' as any)}
            style={styles.wrappedBtn}
          >
            <Text style={styles.wrappedBtnText}>✦ WRAPPED</Text>
          </Pressable>
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
    paddingTop: Spacing.md,
    paddingBottom: Spacing.xs,
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
  wrappedBtn: {
    backgroundColor: Colors.accent,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: 999,
    borderWidth: 3,
    borderColor: Colors.black,
  },
  wrappedBtnText: {
    fontFamily: Fonts.display,
    fontSize: FontSizes.sm,
    color: Colors.white,
    letterSpacing: 2,
  },
});
