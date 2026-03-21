import { NeoButton } from '@/components/ui/neo-button';
import { Colors, Fonts, FontSizes, Radii, Spacing } from '@/constants/theme';
import { useBudgetStore } from '@/store/budget-store';
import { useWishlistStore } from '@/store/wishlist-store';
import { categorize } from '@/utils/categorize';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { ArrowLeft, Car, CircleEllipsis, Film, ShoppingBag, Target, Utensils, Zap } from 'lucide-react-native';
import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const iconMap: Record<string, any> = {
  'utensils': Utensils,
  'car': Car,
  'shopping-bag': ShoppingBag,
  'film': Film,
  'zap': Zap,
  'circle-ellipsis': CircleEllipsis,
};

export default function AddGoalScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { addItem } = useWishlistStore();
  const categories = useBudgetStore((s) => s.categories);

  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [categoryId, setCategoryId] = useState('');

  // Auto-detect category as user types the name
  const detectedCatId = name ? categorize(name) : null;

  const handleAdd = () => {
    if (!name.trim() || !price.trim() || !categoryId) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    addItem(name.trim(), parseFloat(price), categoryId);
    router.back();
  };

  const canSubmit = name.trim().length > 0 && price.trim().length > 0 && categoryId !== '';

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + Spacing.md }]}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <ArrowLeft size={28} color={Colors.white} strokeWidth={2.5} />
        </Pressable>
        <Text style={styles.headerTitle}>New Goal</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 100 }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Big hero label */}
        <Text style={styles.hero}>WHAT DO{'\n'}YOU WANT?</Text>

        {/* Name Input */}
        <View style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>ITEM NAME</Text>
          <TextInput
            style={styles.bigInput}
            placeholder="e.g. AirPods Pro"
            placeholderTextColor="rgba(255,255,255,0.2)"
            value={name}
            onChangeText={setName}
            autoCapitalize="words"
            autoFocus
          />
        </View>

        {/* Price Input */}
        <View style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>PRICE</Text>
          <View style={styles.priceRow}>
            <Text style={styles.rupee}>₹</Text>
            <TextInput
              style={[styles.bigInput, { flex: 1, borderWidth: 0, paddingLeft: 0 }]}
              placeholder="0"
              placeholderTextColor="rgba(255,255,255,0.2)"
              value={price}
              onChangeText={setPrice}
              keyboardType="numeric"
            />
          </View>
          <View style={styles.priceDivider} />
        </View>

        {/* Category Picker */}
        <View style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>CATEGORY</Text>
          <View style={styles.chipGrid}>
            {categories.map((cat) => {
              const isSelected = categoryId === cat.id;
              const isAutoDetected = cat.id === detectedCatId;
              const LucideIcon = iconMap[cat.icon] || Target;
              return (
                <Pressable
                  key={cat.id}
                  onPress={() => {
                    Haptics.selectionAsync();
                    setCategoryId(cat.id);
                  }}
                  style={[
                    styles.chip,
                    { borderColor: isSelected ? cat.color : 'rgba(255,255,255,0.2)' },
                    isSelected && { backgroundColor: cat.color },
                  ]}
                >
                  <LucideIcon
                    size={16}
                    color={isSelected ? Colors.black : isAutoDetected ? cat.color : 'rgba(255,255,255,0.5)'}
                    strokeWidth={2.5}
                  />
                  <Text style={[
                    styles.chipText,
                    { color: isSelected ? Colors.black : isAutoDetected ? cat.color : 'rgba(255,255,255,0.5)' }
                  ]}>
                    {cat.name}
                  </Text>
                  {isAutoDetected && !isSelected && (
                    <View style={[styles.autoDot, { backgroundColor: cat.color }]} />
                  )}
                </Pressable>
              );
            })}
          </View>
        </View>
      </ScrollView>

      {/* Bottom CTA */}
      <View style={[styles.footer, { paddingBottom: insets.bottom + Spacing.md }]}>
        <NeoButton
          title={canSubmit ? 'ADD TO GOALS' : 'FILL IN ALL FIELDS'}
          variant="primary"
          size="lg"
          onPress={handleAdd}
          disabled={!canSubmit}
          style={{ backgroundColor: canSubmit ? '#DFFF00' : Colors.surfaceLight }}
          textStyle={{ color: canSubmit ? Colors.black : Colors.textMuted, fontSize: FontSizes.lg }}
        />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  backBtn: {
    padding: Spacing.xs,
  },
  headerTitle: {
    fontFamily: Fonts.display,
    fontSize: FontSizes.lg,
    color: Colors.textSecondary,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.lg,
  },
  hero: {
    fontFamily: Fonts.display,
    fontSize: 52,
    lineHeight: 52,
    color: Colors.white,
    marginBottom: Spacing.xxl,
  },
  fieldGroup: {
    marginBottom: Spacing.xl,
  },
  fieldLabel: {
    fontFamily: Fonts.display,
    fontSize: FontSizes.sm,
    color: Colors.textMuted,
    letterSpacing: 3,
    marginBottom: Spacing.sm,
  },
  bigInput: {
    fontFamily: Fonts.display,
    fontSize: FontSizes.xxl,
    color: Colors.white,
    borderBottomWidth: 3,
    borderBottomColor: 'rgba(255,255,255,0.2)',
    paddingVertical: Spacing.sm,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 3,
    borderBottomColor: 'rgba(255,255,255,0.2)',
  },
  rupee: {
    fontFamily: Fonts.display,
    fontSize: FontSizes.xxl,
    color: 'rgba(255,255,255,0.4)',
    paddingRight: Spacing.xs,
    paddingVertical: Spacing.sm,
  },
  priceDivider: {
    height: 0,
  },
  chipGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderWidth: 2,
    borderRadius: Radii.pill,
    backgroundColor: 'transparent',
  },
  chipText: {
    fontFamily: Fonts.display,
    fontSize: FontSizes.sm,
  },
  autoDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginLeft: 2,
  },
  footer: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
});
