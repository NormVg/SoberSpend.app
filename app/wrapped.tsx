import { Borders, Colors, Fonts, FontSizes, Radii, Spacing } from '@/constants/theme';
import { useBudgetStore } from '@/store/budget-store';
import { useExpenseStore } from '@/store/expense-store';
import { formatCurrency } from '@/utils/format';
import { useRouter } from 'expo-router';
import { Calendar, ChevronRight, Flame, Scale, ShoppingBag, Snowflake, TrendingUp } from 'lucide-react-native';
import React, { useRef, useState } from 'react';
import {
  Dimensions,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');

// ─── Roast lines by persona ──────────────────────────────────────────────────
const ROAST_LINES: Record<string, string[]> = {
  Spender: [
    'Your wallet called. It filed for divorce.',
    'Impressive. You treated your budget like a suggestion.',
    'You didn\'t buy things this month. You adopted them. Permanently.',
    'Financial advisors fear you.',
    'You should donate yourself to science. Specifically, to study where money goes.',
  ],
  Balanced: [
    'Look at you, barely surviving on vibes and ambiguity.',
    'You\'re not a Saver. You\'re not a Spender. You\'re just... confused.',
    'The Switzerland of finances. Neutral. Unchallenging. Beige.',
    'You spent exactly enough to feel guilty, but not enough to feel free.',
    'Mediocrity, but make it financial.',
  ],
  Saver: [
    'Relax. Money is meant to be spent. You don\'t get a trophy for dying rich.',
    'You have ₹0 in fun spending. Your bank account is healthy. Your soul is not.',
    'Congratulations, your savings account likes you. Nobody else does.',
    'You\'re one spreadsheet away from becoming a meme.',
    'Living like tomorrow never comes — because you\'re saving for a tomorrow that never gets enjoyed.',
  ],
};

function getRoastLine(persona: string | null): string {
  const lines = ROAST_LINES[persona ?? 'Balanced'] ?? ROAST_LINES.Balanced;
  return lines[Math.floor(Math.random() * lines.length)];
}

// ─── Data helpers ─────────────────────────────────────────────────────────────
function useWrappedData() {
  const expenses = useExpenseStore((s) => s.expenses);
  const { monthlyBudget, categories, financialPersonality, userName, spendingWeakness } = useBudgetStore();

  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const weeklyExpenses = expenses.filter((e) => new Date(e.date) >= weekAgo);
  const monthlyExpenses = expenses.filter((e) => new Date(e.date) >= monthStart);

  const weeklyTotal = weeklyExpenses.reduce((s, e) => s + e.amount, 0);
  const monthlyTotal = monthlyExpenses.reduce((s, e) => s + e.amount, 0);

  // top category this month
  const catTotals: Record<string, number> = {};
  for (const exp of monthlyExpenses) {
    catTotals[exp.category] = (catTotals[exp.category] ?? 0) + exp.amount;
  }
  const sortedCats = Object.entries(catTotals).sort((a, b) => b[1] - a[1]);
  const topCatId = sortedCats[0]?.[0] ?? null;
  const topCatAmount = sortedCats[0]?.[1] ?? 0;
  const topCategory = categories.find((c) => c.id === topCatId);

  const avgDailySpend = monthlyExpenses.length
    ? monthlyTotal / Math.max(1, now.getDate())
    : 0;

  const spendPercent = monthlyBudget > 0
    ? Math.min(100, Math.round((monthlyTotal / monthlyBudget) * 100))
    : 0;

  return {
    weeklyTotal,
    monthlyTotal,
    monthlyBudget,
    avgDailySpend,
    spendPercent,
    topCategory,
    topCatAmount,
    financialPersonality,
    userName,
    spendingWeakness,
    txCount: monthlyExpenses.length,
    roastLine: getRoastLine(financialPersonality),
  };
}

// ─── Individual Slide Components ─────────────────────────────────────────────

function SlideIntro({ data }: { data: ReturnType<typeof useWrappedData> }) {
  return (
    <View style={[slide.container, { backgroundColor: '#0A0A0A' }]}>
      <View style={slide.stackWrapper}>
        <View style={[slide.shadowBlock, { backgroundColor: Colors.white }]} />
        <View style={[slide.card, { backgroundColor: Colors.accent, borderColor: Colors.black }]}>
          <Text style={[slide.eyebrow, { color: 'rgba(0,0,0,0.5)' }]}>✦ YOUR MONTH IN REVIEW ✦</Text>
          <Text style={[slide.heroNumber, { color: Colors.black }]}>SPENDING{`\n`}WRAPPED</Text>
          <Text style={[slide.subtitle, { color: 'rgba(0,0,0,0.7)' }]}>
            Hey {data.userName || 'Stranger'}, here's the brutal truth about your money this month.
          </Text>
          <View style={[slide.pill, { backgroundColor: Colors.black, borderColor: Colors.black }]}>
            <Text style={[slide.pillText, { color: Colors.accent }]}>SWIPE TO SEE →</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

function SlideWeekly({ data }: { data: ReturnType<typeof useWrappedData> }) {
  return (
    <View style={[slide.container, { backgroundColor: '#0A0A0A' }]}>
      <View style={slide.stackWrapper}>
        <View style={[slide.shadowBlock, { backgroundColor: Colors.yellow }]} />
        <View style={[slide.card, { backgroundColor: '#1A1A1A', borderColor: Colors.yellow }]}>
          <View style={[slide.iconCircle, { borderColor: Colors.yellow }]}>
            <Calendar size={36} color={Colors.yellow} strokeWidth={2.5} />
          </View>
          <Text style={slide.eyebrow}>THIS WEEK</Text>
          <Text style={[slide.heroNumber, { color: Colors.yellow }]}>
            {formatCurrency(data.weeklyTotal)}
          </Text>
          <Text style={[slide.subtitle, { color: Colors.textSecondary }]}>
            that's{' '}
            <Text style={{ color: Colors.yellow }}>
              {formatCurrency(data.weeklyTotal / 7)} a day
            </Text>
            {' '}on average.{data.weeklyTotal > 5000 ? ' Yikes.' : ' Not bad.'}
          </Text>
          <View style={[slide.pill, { backgroundColor: Colors.yellow, borderColor: Colors.black }]}>
            <Text style={[slide.pillText, { color: Colors.black }]}>7-DAY RECAP</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

function SlideMonthly({ data }: { data: ReturnType<typeof useWrappedData> }) {
  const overBudget = data.monthlyTotal > data.monthlyBudget;
  const accentColor = overBudget ? Colors.exceeded : '#A8E6CF';
  return (
    <View style={[slide.container, { backgroundColor: '#0A0A0A' }]}>
      <View style={slide.stackWrapper}>
        <View style={[slide.shadowBlock, { backgroundColor: accentColor }]} />
        <View style={[slide.card, { backgroundColor: '#1A1A1A', borderColor: accentColor }]}>
          <View style={[slide.iconCircle, { borderColor: accentColor }]}>
            <TrendingUp size={36} color={accentColor} strokeWidth={2.5} />
          </View>
          <Text style={slide.eyebrow}>THIS MONTH</Text>
          <Text style={[slide.heroNumber, { color: accentColor }]}>
            {data.spendPercent}%
          </Text>
          <Text style={[slide.statLabel, { color: Colors.textSecondary }]}>
            OF BUDGET USED
          </Text>
          <Text style={[slide.subtitle, { color: Colors.textSecondary, marginTop: Spacing.sm }]}>
            {formatCurrency(data.monthlyTotal)} spent out of {formatCurrency(data.monthlyBudget)}{' '}
            across {data.txCount} transactions.
          </Text>
          {overBudget && (
            <View style={[slide.pill, { backgroundColor: Colors.exceeded, borderColor: Colors.black }]}>
              <Text style={[slide.pillText, { color: Colors.white }]}>OVER BUDGET 💀</Text>
            </View>
          )}
          {!overBudget && (
            <View style={[slide.pill, { backgroundColor: accentColor, borderColor: Colors.black }]}>
              <Text style={[slide.pillText, { color: Colors.black }]}>WITHIN BUDGET ✓</Text>
            </View>
          )}
        </View>
      </View>
    </View>
  );
}

function SlideTopCategory({ data }: { data: ReturnType<typeof useWrappedData> }) {
  const cat = data.topCategory;
  const color = cat?.color ?? Colors.accent;
  return (
    <View style={[slide.container, { backgroundColor: '#0A0A0A' }]}>
      <View style={slide.stackWrapper}>
        <View style={[slide.shadowBlock, { backgroundColor: color }]} />
        <View style={[slide.card, { backgroundColor: '#1A1A1A', borderColor: color }]}>
          <View style={[slide.iconCircle, { borderColor: color }]}>
            <ShoppingBag size={36} color={color} strokeWidth={2.5} />
          </View>
          <Text style={slide.eyebrow}>YOUR BIGGEST DRAIN</Text>
          <Text style={[slide.heroNumber, { color }]}>
            {cat?.name.toUpperCase() ?? 'N/A'}
          </Text>
          <Text style={[slide.statLabel, { color: Colors.textSecondary }]}>
            {formatCurrency(data.topCatAmount)} THIS MONTH
          </Text>
          <Text style={[slide.subtitle, { color: Colors.textSecondary, marginTop: Spacing.sm }]}>
            {cat
              ? `Most of your money vaporized into ${cat.name.toLowerCase()}. Budget was ${formatCurrency(cat.budgetLimit)}.`
              : 'No transactions logged yet.'}
          </Text>
          <View style={[slide.pill, { backgroundColor: color, borderColor: Colors.black }]}>
            <Text style={[slide.pillText, { color: Colors.black }]}>CATEGORY KING 👑</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

function SlideRoast({ data, onDone }: { data: ReturnType<typeof useWrappedData>; onDone: () => void }) {
  const persona = data.financialPersonality ?? 'Balanced';
  const personaColor = persona === 'Saver' ? '#00FFFF' : persona === 'Spender' ? Colors.accent : '#DFFF00';
  const textColor = persona === 'Spender' ? Colors.white : Colors.black;
  const PersonaIcon = persona === 'Saver' ? Snowflake : persona === 'Spender' ? Flame : Scale;

  return (
    <View style={[slide.container, { backgroundColor: '#0A0A0A' }]}>
      <View style={slide.stackWrapper}>
        <View style={[slide.shadowBlock, { backgroundColor: personaColor }]} />
        <View style={[slide.card, { backgroundColor: '#111', borderColor: personaColor }]}>
          <View style={[slide.iconCircle, { backgroundColor: personaColor, borderColor: Colors.black }]}>
            <PersonaIcon size={36} color={Colors.black} strokeWidth={2.5} />
          </View>
          <Text style={slide.eyebrow}>THE ROAST 🔥</Text>
          <Text style={[slide.roastText, { color: personaColor }]}>
            "{data.roastLine}"
          </Text>
          <Text style={[slide.statLabel, { color: Colors.textMuted, marginTop: Spacing.md }]}>
            — YOUR FINANCIAL PERSONALITY, THE {persona.toUpperCase()}
          </Text>
          <Pressable
            style={[slide.doneBtn, { backgroundColor: personaColor, borderColor: Colors.black }]}
            onPress={onDone}
          >
            <Text style={[slide.doneBtnText, { color: Colors.black }]}>CLOSE WRAPPED</Text>
            <ChevronRight size={18} color={Colors.black} strokeWidth={3} />
          </Pressable>
        </View>
      </View>
    </View>
  );
}

// ─── Progress Bar ─────────────────────────────────────────────────────────────
function ProgressDots({ total, current }: { total: number; current: number }) {
  return (
    <View style={progress.row}>
      {Array.from({ length: total }).map((_, i) => (
        <View
          key={i}
          style={[
            progress.dot,
            i < current ? progress.dotFilled : i === current ? progress.dotActive : progress.dotEmpty,
          ]}
        />
      ))}
    </View>
  );
}

// ─── Main Screen ─────────────────────────────────────────────────────────────
export default function WrappedScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const data = useWrappedData();
  const [slideIndex, setSlideIndex] = useState(0);
  const scrollRef = useRef<ScrollView>(null);
  const TOTAL = 5;

  const goNext = () => {
    if (slideIndex < TOTAL - 1) {
      const next = slideIndex + 1;
      scrollRef.current?.scrollTo({ x: next * SCREEN_W, animated: true });
      setSlideIndex(next);
    }
  };

  const handleScroll = (e: any) => {
    const idx = Math.round(e.nativeEvent.contentOffset.x / SCREEN_W);
    setSlideIndex(idx);
  };

  const slides = [
    <SlideIntro data={data} key="intro" />,
    <SlideWeekly data={data} key="weekly" />,
    <SlideMonthly data={data} key="monthly" />,
    <SlideTopCategory data={data} key="category" />,
    <SlideRoast data={data} onDone={() => router.back()} key="roast" />,
  ];

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      {/* Progress */}
      <View style={[styles.header, { paddingTop: Spacing.sm }]}>
        <ProgressDots total={TOTAL} current={slideIndex} />
      </View>

      {/* Slides */}
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        scrollEventThrottle={16}
        onMomentumScrollEnd={handleScroll}
        style={{ flex: 1 }}
      >
        {slides.map((s, i) => (
          <Pressable
            key={i}
            onPress={goNext}
            style={{ width: SCREEN_W, flex: 1 }}
          >
            {s}
          </Pressable>
        ))}
      </ScrollView>

      {/* Tap hint */}
      {slideIndex < TOTAL - 1 && (
        <View style={[styles.hintRow, { paddingBottom: insets.bottom + Spacing.md }]}>
          <Text style={styles.hintText}>TAP ANYWHERE TO ADVANCE</Text>
        </View>
      )}
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#0A0A0A',
  },
  header: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.sm,
  },
  hintRow: {
    alignItems: 'center',
    paddingTop: Spacing.sm,
  },
  hintText: {
    fontFamily: Fonts.display,
    fontSize: FontSizes.xs,
    color: Colors.textMuted,
    letterSpacing: 2,
  },
});

// Slide shared styles
const slide = StyleSheet.create({
  container: {
    width: SCREEN_W,
    flex: 1,
    paddingHorizontal: Spacing.lg,
    justifyContent: 'center',
  },
  stackWrapper: {
    position: 'relative',
  },
  shadowBlock: {
    position: 'absolute',
    top: 6,
    left: 6,
    right: -6,
    bottom: -6,
    borderRadius: Radii.lg,
    borderWidth: Borders.medium,
    borderColor: Colors.black,
  },
  card: {
    borderWidth: Borders.thick,
    borderRadius: Radii.lg,
    padding: Spacing.xl,
    paddingTop: Spacing.xxl,
    backgroundColor: '#1A1A1A',
    alignItems: 'center',
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#222',
    borderWidth: Borders.medium,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.lg,
  },
  eyebrow: {
    fontFamily: Fonts.display,
    fontSize: FontSizes.sm,
    color: Colors.textMuted,
    letterSpacing: 3,
    marginBottom: Spacing.sm,
    textAlign: 'center',
  },
  heroNumber: {
    fontFamily: Fonts.display,
    fontSize: 60,
    color: Colors.accent,
    lineHeight: 64,
    textAlign: 'center',
  },
  statLabel: {
    fontFamily: Fonts.display,
    fontSize: FontSizes.sm,
    letterSpacing: 2,
    textAlign: 'center',
    marginTop: 4,
  },
  subtitle: {
    fontFamily: Fonts.display,
    fontSize: FontSizes.md,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginTop: Spacing.lg,
  },
  roastText: {
    fontFamily: Fonts.accent,
    fontSize: 30,
    textAlign: 'center',
    lineHeight: 38,
    marginTop: Spacing.sm,
    paddingHorizontal: Spacing.sm,
  },
  pill: {
    marginTop: Spacing.xl,
    backgroundColor: Colors.accent,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: Radii.pill,
    borderWidth: Borders.medium,
    borderColor: Colors.black,
  },
  pillText: {
    fontFamily: Fonts.display,
    fontSize: FontSizes.sm,
    color: Colors.white,
    letterSpacing: 2,
  },
  doneBtn: {
    marginTop: Spacing.xl,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: Radii.pill,
    borderWidth: Borders.thick,
  },
  doneBtnText: {
    fontFamily: Fonts.display,
    fontSize: FontSizes.md,
    letterSpacing: 2,
  },
});

// Progress bar styles
const progress = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 6,
    justifyContent: 'center',
  },
  dot: {
    height: 4,
    flex: 1,
    borderRadius: 2,
  },
  dotFilled: {
    backgroundColor: Colors.accent,
  },
  dotActive: {
    backgroundColor: Colors.white,
  },
  dotEmpty: {
    backgroundColor: Colors.border,
  },
});
