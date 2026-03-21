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
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width: SCREEN_W } = Dimensions.get('window');
const DANGER_RED = '#FF1A1A';

// ─── Roast lines by persona ───────────────────────────────────────────────────
const ROAST_LINES: Record<string, string[]> = {
  Spender: [
    "You didn't overspend. You committed financial arson.",
    "Your bank statement reads like a trauma response.",
    "Your 'treat yourself' became a subscription.",
    "You are the reason emergency funds exist. You ARE the emergency.",
    "Splurging is a choice. You made it 47 times this month.",
    "You bought things that don't exist yet. Pre-orders. On credit.",
    "Therapists call what you did retail catastrophizing.",
  ],
  Balanced: [
    "Not broke. Not thriving. Just beige. Financially beige.",
    "You spent enough to feel guilty. Not enough to feel alive.",
    "You want to save but also want Zomato. So you got both. Neither well.",
    "The bank sees you as financially meh. You are fine. Just fine.",
    "Perfectly average. Financial gray area. Boring energy.",
    "You are the human equivalent of a shrug.",
  ],
  Saver: [
    "You have money. And zero stories to tell. Congratulations.",
    "You screenshot your balance and send it to no one.",
    "No one at your funeral will say he really lived.",
    "Rich cemetery. That was the goal, right?",
    "You could afford a life experience. You chose a fixed deposit.",
    "Your idea of fun is watching savings go up by 17 rupees.",
    "You watched 3 streaming services die waiting for a sale.",
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

  const catTotals: Record<string, number> = {};
  for (const exp of monthlyExpenses) {
    catTotals[exp.category] = (catTotals[exp.category] ?? 0) + exp.amount;
  }
  const sortedCats = Object.entries(catTotals).sort((a, b) => b[1] - a[1]);
  const topCatId = sortedCats[0]?.[0] ?? null;
  const topCatAmount = sortedCats[0]?.[1] ?? 0;
  const topCategory = categories.find((c) => c.id === topCatId);

  const spendPercent = monthlyBudget > 0
    ? Math.min(100, Math.round((monthlyTotal / monthlyBudget) * 100))
    : 0;

  return {
    weeklyTotal,
    monthlyTotal,
    monthlyBudget,
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

// ─── Slide Components ─────────────────────────────────────────────────────────

function SlideIntro({ data }: { data: ReturnType<typeof useWrappedData> }) {
  return (
    <View style={[slide.container, { backgroundColor: '#0A0A0A' }]}>
      <View style={slide.stackWrapper}>
        <View style={[slide.shadowBlock, { backgroundColor: Colors.white }]} />
        <View style={[slide.card, { backgroundColor: Colors.accent, borderColor: Colors.black }]}>
          <Text style={[slide.eyebrow, { color: 'rgba(0,0,0,0.5)' }]}>YOUR MONTH IN REVIEW</Text>
          <Text style={[slide.heroNumber, { color: Colors.black }]}>SPENDING{`\n`}WRAPPED</Text>
          <Text style={[slide.subtitle, { color: 'rgba(0,0,0,0.7)' }]}>
            Hey {data.userName || 'Stranger'}, here is the brutal truth about your money this month.
          </Text>
          <View style={[slide.pill, { backgroundColor: Colors.black, borderColor: Colors.black }]}>
            <Text style={[slide.pillText, { color: Colors.accent }]}>SWIPE TO SEE</Text>
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
            that is{' '}
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
          <Text style={[slide.statLabel, { color: Colors.textSecondary }]}>OF BUDGET USED</Text>
          <Text style={[slide.subtitle, { color: Colors.textSecondary, marginTop: Spacing.sm }]}>
            {formatCurrency(data.monthlyTotal)} spent out of {formatCurrency(data.monthlyBudget)}{' '}
            across {data.txCount} transactions.
          </Text>
          {overBudget && (
            <View style={[slide.pill, { backgroundColor: Colors.exceeded, borderColor: Colors.black }]}>
              <Text style={[slide.pillText, { color: Colors.white }]}>OVER BUDGET</Text>
            </View>
          )}
          {!overBudget && (
            <View style={[slide.pill, { backgroundColor: accentColor, borderColor: Colors.black }]}>
              <Text style={[slide.pillText, { color: Colors.black }]}>WITHIN BUDGET</Text>
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
            <Text style={[slide.pillText, { color: Colors.black }]}>CATEGORY KING</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

// ─── Roast card — full danger red, aggressive ─────────────────────────────────
function SlideRoast({ data, onDone }: { data: ReturnType<typeof useWrappedData>; onDone: () => void }) {
  const persona = data.financialPersonality ?? 'Balanced';
  const PersonaIcon = persona === 'Saver' ? Snowflake : persona === 'Spender' ? Flame : Scale;

  return (
    <View style={roast.outer}>
      {/* Hard danger shadow */}
      <View style={roast.shadow} />

      <View style={roast.card}>
        {/* Warning stripe header */}
        <View style={roast.stripe}>
          <Text style={roast.stripeText}>WARNING — FINANCIAL VERDICT — WARNING</Text>
        </View>

        {/* Giant skull */}
        <Text style={roast.skull}>☠</Text>

        {/* Persona badge */}
        <View style={roast.personaBadge}>
          <PersonaIcon size={14} color={DANGER_RED} strokeWidth={3} />
          <Text style={roast.personaLabel}>THE {persona.toUpperCase()}</Text>
        </View>

        {/* THE actual roast in huge type */}
        <Text style={roast.roastQuote}>
          {`"${data.roastLine}"`}
        </Text>

        {/* Attribution */}
        <Text style={roast.attribution}>
          — SOBER.SPEND FINANCIAL CRIMES UNIT
        </Text>

        {/* Bottom divider */}
        <View style={roast.divider} />

        {/* CTA */}
        <Pressable style={roast.closeBtn} onPress={onDone}>
          <Text style={roast.closeBtnText}>I ACCEPT MY FATE</Text>
          <ChevronRight size={20} color={Colors.black} strokeWidth={3} />
        </Pressable>
      </View>
    </View>
  );
}

// ─── Progress Dots ────────────────────────────────────────────────────────────
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

// ─── Main Screen ──────────────────────────────────────────────────────────────
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
      <View style={[styles.header, { paddingTop: Spacing.sm }]}>
        <ProgressDots total={TOTAL} current={slideIndex} />
      </View>

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

      {slideIndex < TOTAL - 1 && (
        <View style={[styles.hintRow, { paddingBottom: insets.bottom + Spacing.md }]}>
          <Text style={styles.hintText}>TAP ANYWHERE TO ADVANCE</Text>
        </View>
      )}
    </View>
  );
}

// ─── Shared slide styles ──────────────────────────────────────────────────────
const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0A0A0A' },
  header: { paddingHorizontal: Spacing.lg, paddingBottom: Spacing.sm },
  hintRow: { alignItems: 'center', paddingTop: Spacing.sm },
  hintText: {
    fontFamily: Fonts.display,
    fontSize: FontSizes.xs,
    color: Colors.textMuted,
    letterSpacing: 2,
  },
});

const slide = StyleSheet.create({
  container: {
    width: SCREEN_W,
    flex: 1,
    paddingHorizontal: Spacing.lg,
    justifyContent: 'center',
  },
  stackWrapper: { position: 'relative' },
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
});

// ─── ROAST card specific styles ───────────────────────────────────────────────
const roast = StyleSheet.create({
  outer: {
    width: SCREEN_W,
    flex: 1,
    paddingHorizontal: Spacing.lg,
    justifyContent: 'center',
    backgroundColor: '#0A0A0A',
  },
  shadow: {
    position: 'absolute',
    top: 6,
    left: Spacing.lg + 6,
    right: Spacing.lg - 6,
    bottom: -6,
    backgroundColor: DANGER_RED,
    borderRadius: Radii.lg,
    borderWidth: Borders.medium,
    borderColor: Colors.black,
  },
  card: {
    backgroundColor: Colors.black,
    borderWidth: 4,
    borderColor: DANGER_RED,
    borderRadius: Radii.lg,
    overflow: 'hidden',
    alignItems: 'center',
  },
  stripe: {
    width: '100%',
    backgroundColor: DANGER_RED,
    paddingVertical: 10,
    alignItems: 'center',
  },
  stripeText: {
    fontFamily: Fonts.display,
    fontSize: FontSizes.xs,
    color: Colors.black,
    letterSpacing: 2,
    textAlign: 'center',
  },
  skull: {
    fontSize: 80,
    textAlign: 'center',
    marginTop: Spacing.xl,
    marginBottom: Spacing.sm,
  },
  personaBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#1A0000',
    borderWidth: 2,
    borderColor: DANGER_RED,
    borderRadius: Radii.pill,
    paddingHorizontal: Spacing.md,
    paddingVertical: 5,
    marginBottom: Spacing.lg,
  },
  personaLabel: {
    fontFamily: Fonts.display,
    fontSize: FontSizes.sm,
    color: DANGER_RED,
    letterSpacing: 3,
  },
  roastQuote: {
    fontFamily: Fonts.display,
    fontSize: 26,
    color: Colors.white,
    textAlign: 'center',
    lineHeight: 34,
    paddingHorizontal: Spacing.xl,
    marginBottom: Spacing.lg,
  },
  attribution: {
    fontFamily: Fonts.display,
    fontSize: FontSizes.xs,
    color: DANGER_RED,
    letterSpacing: 2,
    textAlign: 'center',
    marginBottom: Spacing.lg,
  },
  divider: {
    width: '90%',
    height: 3,
    backgroundColor: DANGER_RED,
    marginBottom: Spacing.lg,
  },
  closeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: DANGER_RED,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: Radii.pill,
    borderWidth: Borders.thick,
    borderColor: Colors.black,
    marginBottom: Spacing.xl,
  },
  closeBtnText: {
    fontFamily: Fonts.display,
    fontSize: FontSizes.lg,
    color: Colors.black,
    letterSpacing: 2,
  },
});

// ─── Progress bar ─────────────────────────────────────────────────────────────
const progress = StyleSheet.create({
  row: { flexDirection: 'row', gap: 6, justifyContent: 'center' },
  dot: { height: 4, flex: 1, borderRadius: 2 },
  dotFilled: { backgroundColor: Colors.accent },
  dotActive: { backgroundColor: Colors.white },
  dotEmpty: { backgroundColor: Colors.border },
});
