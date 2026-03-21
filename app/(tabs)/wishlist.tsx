import { NeoButton } from '@/components/ui/neo-button';
import { NeoCard } from '@/components/ui/neo-card';
import { Borders, Colors, Fonts, FontSizes, Radii, Spacing } from '@/constants/theme';
import { useBudgetStore } from '@/store/budget-store';
import { useExpenseStore } from '@/store/expense-store';
import { useWishlistStore } from '@/store/wishlist-store';
import { currentMonthExpenses, daysToAfford, totalSpent } from '@/utils/budget-engine';
import { formatCurrency } from '@/utils/format';
import * as Haptics from 'expo-haptics';
import { Trash2 } from 'lucide-react-native';
import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function WishlistScreen() {
  const insets = useSafeAreaInsets();
  const { items, addItem, removeItem } = useWishlistStore();
  const expenses = useExpenseStore((s) => s.expenses);
  const monthlyBudget = useBudgetStore((s) => s.monthlyBudget);

  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [showForm, setShowForm] = useState(false);

  const monthExpenses = currentMonthExpenses(expenses);
  const spent = totalSpent(monthExpenses);

  const handleAdd = () => {
    if (!name.trim() || !price.trim()) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    addItem(name.trim(), parseFloat(price));
    setName('');
    setPrice('');
    setShowForm(false);
  };

  const handleRemove = (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    removeItem(id);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.headerRow}>
          <Text style={styles.title}>Wishlist</Text>
          <NeoButton
            title={showForm ? '✕' : '+'}
            variant="outline"
            size="sm"
            onPress={() => setShowForm(!showForm)}
            style={{ paddingHorizontal: Spacing.md }}
          />
        </View>

        {/* Add Item Form */}
        {showForm && (
          <NeoCard color={Colors.surface} style={{ marginBottom: Spacing.lg }}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Item Name</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. AirPods Pro"
                placeholderTextColor={Colors.textMuted}
                value={name}
                onChangeText={setName}
              />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Price (₹)</Text>
              <TextInput
                style={styles.input}
                placeholder="0"
                placeholderTextColor={Colors.textMuted}
                value={price}
                onChangeText={setPrice}
                keyboardType="numeric"
              />
            </View>
            <NeoButton
              title="Add to Wishlist"
              variant="primary"
              size="md"
              onPress={handleAdd}
              disabled={!name.trim() || !price.trim()}
            />
          </NeoCard>
        )}

        {/* Wishlist Items */}
        {items.map((item) => {
          const days = daysToAfford(item.price, monthlyBudget, spent);
          const daysText = days < 0 ? "Can't afford at current rate" : `~${days} days to save`;

          return (
            <View key={item.id} style={{ marginBottom: Spacing.md }}>
              <NeoCard color={Colors.surface}>
                <View style={styles.itemHeader}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.itemName}>{item.name}</Text>
                    <Text style={styles.itemPrice}>{formatCurrency(item.price)}</Text>
                  </View>
                  <Pressable onPress={() => handleRemove(item.id)} hitSlop={10}>
                    <Trash2 size={20} color={Colors.exceeded} strokeWidth={2.5} />
                  </Pressable>
                </View>
                <View style={[styles.daysTag, { backgroundColor: days < 0 ? Colors.exceeded : Colors.safe }]}>
                  <Text style={styles.daysText}>{daysText}</Text>
                </View>
              </NeoCard>
            </View>
          );
        })}

        {items.length === 0 && !showForm && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>🎯</Text>
            <Text style={styles.emptyText}>Your wishlist is empty</Text>
            <Text style={styles.emptySubtext}>Add items to track savings goals</Text>
          </View>
        )}

        {/* Bottom Spacer for Nav */}
        <View style={{ height: 130 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: Spacing.lg,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.lg,
  },
  title: {
    fontFamily: Fonts.display,
    fontSize: FontSizes.xxl,
    color: Colors.white,
    fontWeight: '700',
  },
  inputGroup: {
    marginBottom: Spacing.md,
  },
  inputLabel: {
    fontFamily: Fonts.display,
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
  },
  input: {
    borderWidth: Borders.thin,
    borderColor: Colors.border,
    borderRadius: Radii.sm,
    backgroundColor: Colors.surfaceLight,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    fontFamily: Fonts.display,
    fontSize: FontSizes.lg,
    color: Colors.white,
  },
  itemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  itemName: {
    fontFamily: Fonts.display,
    fontSize: FontSizes.lg,
    color: Colors.white,
    fontWeight: '700',
  },
  itemPrice: {
    fontFamily: Fonts.display,
    fontSize: FontSizes.md,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  daysTag: {
    alignSelf: 'flex-start',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: Radii.pill,
    borderWidth: Borders.thin,
    borderColor: Colors.black,
  },
  daysText: {
    fontFamily: Fonts.display,
    fontSize: FontSizes.sm,
    color: Colors.black,
    fontWeight: '700',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: Spacing.xxl,
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: Spacing.md,
  },
  emptyText: {
    fontFamily: Fonts.display,
    fontSize: FontSizes.xl,
    color: Colors.textSecondary,
    fontWeight: '700',
  },
  emptySubtext: {
    fontFamily: Fonts.display,
    fontSize: FontSizes.md,
    color: Colors.textMuted,
    marginTop: Spacing.xs,
  },
});
