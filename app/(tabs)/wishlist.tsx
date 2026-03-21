import { SavingsGoalCard } from '@/components/insights/savings-goal-card';
import { NeoButton } from '@/components/ui/neo-button';
import { NeoCard } from '@/components/ui/neo-card';
import { Borders, Colors, Fonts, FontSizes, Radii, Spacing } from '@/constants/theme';
import { useBudgetStore } from '@/store/budget-store';
import { useExpenseStore } from '@/store/expense-store';
import { useWishlistStore } from '@/store/wishlist-store';
import { currentMonthExpenses, daysToAfford, totalSpent } from '@/utils/budget-engine';
import { formatCurrency } from '@/utils/format';
import * as Haptics from 'expo-haptics';
import { Car, Circle, CircleEllipsis, Film, ShoppingBag, Utensils, Zap } from 'lucide-react-native';
import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const iconMap: Record<string, any> = {
  'utensils': Utensils,
  'car': Car,
  'shopping-bag': ShoppingBag,
  'film': Film,
  'zap': Zap,
  'circle-ellipsis': CircleEllipsis,
};

export default function WishlistScreen() {
  const insets = useSafeAreaInsets();
  const { items, addItem, removeItem } = useWishlistStore();
  const expenses = useExpenseStore((s) => s.expenses);
  const monthlyBudget = useBudgetStore((s) => s.monthlyBudget);
  const categories = useBudgetStore((s) => s.categories);

  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [showCatDropdown, setShowCatDropdown] = useState(false);

  const monthExpenses = currentMonthExpenses(expenses);
  const spent = totalSpent(monthExpenses);

  const handleAdd = () => {
    if (!name.trim() || !price.trim() || !categoryId) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    addItem(name.trim(), parseFloat(price), categoryId);
    setName('');
    setPrice('');
    setCategoryId('');
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

        {/* Wishlist Items */}
        {items.map((item, index) => {
          const days = daysToAfford(item.price, monthlyBudget, spent);
          const isEven = index % 2 === 0;
          const cardColor = isEven ? '#FF85A2' : '#DFFF00';

          const savingsAvailable = Math.max(0, monthlyBudget - spent);
          const progressPercent = Math.min(100, Math.round((savingsAvailable / item.price) * 100));

          const itemCategory = categories.find(c => c.id === item.categoryId);
          const iconString = itemCategory ? itemCategory.icon : undefined;

          return (
            <SavingsGoalCard
              key={item.id}
              title={item.name}
              price={formatCurrency(item.price)}
              daysLeft={days > 0 ? days : 0}
              subtitle={days < 0 ? "CAN'T AFFORD AT CURRENT RATE" : "BASED ON CURRENT SPENDING"}
              color={cardColor}
              icon={iconString}
              progressPercent={progressPercent}
              onDelete={() => handleRemove(item.id)}
            />
          );
        })}

        {items.length === 0 && !showForm && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>🎯</Text>
            <Text style={styles.emptyText}>Your wishlist is empty</Text>
            <Text style={styles.emptySubtext}>Add items to track savings goals</Text>
          </View>
        )}

        {/* Add Item Form (Moved to Bottom) */}
        {showForm && (
          <View style={{ marginTop: Spacing.xl }}>
            <NeoCard color="#00FFFF" style={{ marginBottom: Spacing.sm }}>
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: Colors.black }]}>Item Name</Text>
                <TextInput
                  style={[styles.input, { color: Colors.black, borderColor: Colors.black, backgroundColor: Colors.white }]}
                  placeholder="e.g. AirPods Pro"
                  placeholderTextColor={Colors.textMuted}
                  value={name}
                  onChangeText={setName}
                />
              </View>
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: Colors.black }]}>Price (₹)</Text>
                <TextInput
                  style={[styles.input, { color: Colors.black, borderColor: Colors.black, backgroundColor: Colors.white }]}
                  placeholder="0"
                  placeholderTextColor={Colors.textMuted}
                  value={price}
                  onChangeText={setPrice}
                  keyboardType="numeric"
                />
              </View>
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: Colors.black }]}>Category</Text>
                {/* Dropdown Trigger */}
                <Pressable
                  onPress={() => setShowCatDropdown(!showCatDropdown)}
                  style={[styles.input, { borderColor: Colors.black, backgroundColor: Colors.white, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }]}
                >
                  {(() => {
                    const selected = categories.find(c => c.id === categoryId);
                    const LucideIcon = selected ? (iconMap[selected.icon] || Circle) : null;
                    return selected ? (
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                        {LucideIcon && <LucideIcon size={20} color={Colors.black} strokeWidth={2.5} />}
                        <Text style={{ fontFamily: Fonts.display, fontSize: FontSizes.md, color: Colors.black }}>{selected.name}</Text>
                      </View>
                    ) : (
                      <Text style={{ fontFamily: Fonts.display, fontSize: FontSizes.md, color: Colors.textMuted }}>Pick a category</Text>
                    );
                  })()}
                  <Text style={{ fontFamily: Fonts.display, fontSize: 18, color: Colors.black }}>{showCatDropdown ? '▲' : '▼'}</Text>
                </Pressable>

                {/* Dropdown List */}
                {showCatDropdown && (
                  <View style={{ borderWidth: 3, borderColor: Colors.black, borderRadius: Radii.md, backgroundColor: Colors.white, overflow: 'hidden', marginTop: 4 }}>
                    {categories.map((cat, i) => {
                      const isSelected = categoryId === cat.id;
                      const LucideIcon = iconMap[cat.icon] || Circle;
                      return (
                        <Pressable
                          key={cat.id}
                          onPress={() => {
                            Haptics.selectionAsync();
                            setCategoryId(cat.id);
                            setShowCatDropdown(false);
                          }}
                          style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            gap: 12,
                            padding: 14,
                            backgroundColor: isSelected ? Colors.black : Colors.white,
                            borderTopWidth: i === 0 ? 0 : 2,
                            borderColor: Colors.black,
                          }}
                        >
                          <LucideIcon size={20} color={isSelected ? '#00FFFF' : Colors.black} strokeWidth={2.5} />
                          <Text style={{ fontFamily: Fonts.display, fontSize: FontSizes.md, color: isSelected ? '#00FFFF' : Colors.black }}>{cat.name}</Text>
                        </Pressable>
                      );
                    })}
                  </View>
                )}
              </View>
              <NeoButton
                title="Add to Wishlist"
                variant="primary"
                size="md"
                onPress={handleAdd}
                disabled={!name.trim() || !price.trim() || !categoryId}
                style={{ backgroundColor: Colors.black }}
                textStyle={{ color: Colors.white }}
              />
            </NeoCard>
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
