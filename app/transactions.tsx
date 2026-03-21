import { TransactionItem } from '@/components/dashboard/transaction-item';
import { Colors, Fonts, FontSizes, Radii, Spacing } from '@/constants/theme';
import { useBudgetStore } from '@/store/budget-store';
import { useExpenseStore } from '@/store/expense-store';
import { formatCurrency } from '@/utils/format';
import { useRouter } from 'expo-router';
import { ArrowLeft, Car, Circle, CircleEllipsis, Film, Search, ShoppingBag, Utensils, Zap } from 'lucide-react-native';
import React, { useMemo, useState } from 'react';
import { Pressable, SectionList, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const iconMap: Record<string, any> = {
  'utensils': Utensils, 'car': Car, 'shopping-bag': ShoppingBag,
  'film': Film, 'zap': Zap, 'circle-ellipsis': CircleEllipsis,
};

function formatSectionDate(dateStr: string): string {
  const d = new Date(dateStr);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  if (d.toDateString() === today.toDateString()) return 'TODAY';
  if (d.toDateString() === yesterday.toDateString()) return 'YESTERDAY';
  return d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' }).toUpperCase();
}

export default function TransactionsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const expenses = useExpenseStore((s) => s.expenses);
  const categories = useBudgetStore((s) => s.categories);

  const [search, setSearch] = useState('');
  const [filterCatId, setFilterCatId] = useState<string | null>(null);

  // Filter by search + category
  const filtered = useMemo(() => {
    return expenses.filter((e) => {
      const matchSearch = search.trim() === '' || e.merchant.toLowerCase().includes(search.toLowerCase());
      const matchCat = filterCatId === null || e.category === filterCatId;
      return matchSearch && matchCat;
    });
  }, [expenses, search, filterCatId]);

  // Total of filtered
  const filteredTotal = filtered.reduce((sum, e) => sum + e.amount, 0);

  // Group by date (YYYY-MM-DD)
  const sections = useMemo(() => {
    const groups: Record<string, typeof filtered> = {};
    for (const e of filtered) {
      const day = e.date.slice(0, 10);
      if (!groups[day]) groups[day] = [];
      groups[day].push(e);
    }
    return Object.entries(groups)
      .sort(([a], [b]) => b.localeCompare(a))
      .map(([day, data]) => ({
        title: formatSectionDate(day),
        dayTotal: data.reduce((s, e) => s + e.amount, 0),
        data,
      }));
  }, [filtered]);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <ArrowLeft size={26} color={Colors.white} strokeWidth={2.5} />
        </Pressable>
        <View>
          <Text style={styles.headerTitle}>
            Sober.<Text style={{ color: '#FF85A2' }}>Ledger</Text>
          </Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      {/* Search Bar */}
      <View style={styles.searchRow}>
        <Search size={18} color={Colors.textMuted} style={{ marginRight: Spacing.sm }} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search merchant..."
          placeholderTextColor={Colors.textMuted}
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {/* Category Filter Chips */}
      <View style={styles.filterRow}>
        <Pressable
          onPress={() => setFilterCatId(null)}
          style={[styles.filterChip, filterCatId === null && styles.filterChipActive]}
        >
          <Text style={[styles.filterChipText, filterCatId === null && { color: Colors.black }]}>All</Text>
        </Pressable>
        {categories.map((cat) => {
          const isActive = filterCatId === cat.id;
          const LucideIcon = iconMap[cat.icon] || Circle;
          return (
            <Pressable
              key={cat.id}
              onPress={() => setFilterCatId(isActive ? null : cat.id)}
              style={[styles.filterChip, isActive && { backgroundColor: cat.color, borderColor: cat.color }]}
            >
              <LucideIcon size={13} color={isActive ? Colors.black : Colors.textSecondary} strokeWidth={2.5} />
              <Text style={[styles.filterChipText, isActive && { color: Colors.black }]}>{cat.name}</Text>
            </Pressable>
          );
        })}
      </View>

      {/* Total strip */}
      <View style={styles.totalStrip}>
        <Text style={styles.totalLabel}>{filtered.length} TRANSACTIONS</Text>
        <Text style={styles.totalAmount}>{formatCurrency(filteredTotal)}</Text>
      </View>

      {/* Transaction List */}
      {sections.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyEmoji}>🧾</Text>
          <Text style={styles.emptyText}>No transactions found</Text>
        </View>
      ) : (
        <SectionList
          sections={sections}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingHorizontal: Spacing.lg, paddingBottom: insets.bottom + 40 }}
          showsVerticalScrollIndicator={false}
          stickySectionHeadersEnabled
          renderSectionHeader={({ section }) => (
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionDate}>{section.title}</Text>
              <Text style={styles.sectionTotal}>-{formatCurrency(section.dayTotal)}</Text>
            </View>
          )}
          renderItem={({ item }) => {
            const cat = categories.find((c) => c.id === item.category);
            return <TransactionItem expense={item} category={cat} />;
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
  },
  backBtn: { padding: Spacing.xs },
  headerTitle: {
    fontFamily: Fonts.display,
    fontSize: FontSizes.xxl,
    color: Colors.white,
    fontWeight: '700',
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.xs,
    marginBottom: Spacing.sm,
    backgroundColor: Colors.surface,
    borderRadius: Radii.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  searchInput: {
    flex: 1,
    fontFamily: Fonts.display,
    fontSize: FontSizes.md,
    color: Colors.white,
  },
  filterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.sm,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: Radii.pill,
  },
  filterChipActive: {
    backgroundColor: Colors.white,
    borderColor: Colors.white,
  },
  filterChipText: {
    fontFamily: Fonts.display,
    fontSize: FontSizes.xs,
    color: Colors.textSecondary,
  },
  totalStrip: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.xs,
  },
  totalLabel: {
    fontFamily: Fonts.display,
    fontSize: FontSizes.xs,
    color: Colors.textMuted,
    letterSpacing: 2,
  },
  totalAmount: {
    fontFamily: Fonts.display,
    fontSize: FontSizes.lg,
    color: Colors.white,
    fontWeight: '700',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.bg,
    paddingVertical: Spacing.sm,
    paddingTop: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    marginBottom: 2,
  },
  sectionDate: {
    fontFamily: Fonts.display,
    fontSize: FontSizes.xs,
    color: Colors.textMuted,
    letterSpacing: 2,
  },
  sectionTotal: {
    fontFamily: Fonts.display,
    fontSize: FontSizes.sm,
    color: Colors.exceeded,
    fontWeight: '700',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.md,
  },
  emptyEmoji: { fontSize: 56 },
  emptyText: {
    fontFamily: Fonts.display,
    fontSize: FontSizes.xl,
    color: Colors.textSecondary,
  },
});
