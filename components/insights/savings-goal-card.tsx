import { NeoCard } from '@/components/ui/neo-card';
import { Colors, Fonts, FontSizes, Radii, Spacing } from '@/constants/theme';
import { Car, CircleEllipsis, Film, Laptop, Plane, ShoppingBag, Target, Trash2, Utensils, Zap } from 'lucide-react-native';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

interface SavingsGoalCardProps {
  title: string;
  price: string;
  daysLeft: number;
  subtitle: string;
  color: string;
  icon?: string;
  progressPercent: number;
  onDelete?: () => void;
}

const iconMap: Record<string, any> = {
  'utensils': Utensils,
  'car': Car,
  'shopping-bag': ShoppingBag,
  'film': Film,
  'zap': Zap,
  'circle-ellipsis': CircleEllipsis,
  'laptop': Laptop,
  'plane': Plane,
};

export function SavingsGoalCard({ title, price, daysLeft, subtitle, color, icon, progressPercent, onDelete }: SavingsGoalCardProps) {
  const IconComponent = icon ? (iconMap[icon] || Target) : Target;

  return (
    <NeoCard style={styles.card} color="#2A2A2A" offset={false}>
      <View style={styles.layout}>
        {/* Left Icon Block */}
        <View style={styles.iconContainer}>
          <IconComponent size={32} color={color} strokeWidth={2.5} />
        </View>

        {/* Right Content */}
        <View style={styles.content}>
          <View style={styles.headerRow}>
            <Text style={styles.title} numberOfLines={1}>{title}</Text>
            {onDelete && (
              <Pressable onPress={onDelete} hitSlop={10}>
                <Trash2 size={20} color={Colors.textMuted} strokeWidth={2} />
              </Pressable>
            )}
          </View>
          <Text style={styles.price}>{price}</Text>

          {/* Progress Bar Track */}
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${progressPercent}%`, backgroundColor: color }]} />
          </View>

          <Text style={[styles.days, { color }]}>{daysLeft} DAYS LEFT</Text>
          <Text style={styles.subtitle}>{subtitle}</Text>
        </View>
      </View>
    </NeoCard>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: Spacing.md,
  },
  layout: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 70,
    height: 70,
    backgroundColor: '#1A1A1A',
    borderRadius: Radii.md,
    borderWidth: 2,
    borderColor: Colors.black,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  content: {
    flex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  title: {
    fontFamily: Fonts.display,
    fontSize: FontSizes.lg,
    color: Colors.white,
    textTransform: 'uppercase',
    flex: 1,
    marginRight: Spacing.sm,
  },
  price: {
    fontFamily: Fonts.display,
    fontSize: FontSizes.xs,
    color: Colors.textMuted,
    marginBottom: Spacing.sm,
  },
  progressTrack: {
    height: 8,
    backgroundColor: '#1A1A1A',
    borderRadius: Radii.pill,
    borderWidth: 1,
    borderColor: '#444',
    overflow: 'hidden',
    marginBottom: Spacing.sm,
  },
  progressFill: {
    height: '100%',
    borderRadius: Radii.pill,
  },
  days: {
    fontFamily: Fonts.display,
    fontSize: FontSizes.sm,
    fontWeight: '700',
    marginBottom: 2,
  },
  subtitle: {
    fontFamily: Fonts.display,
    fontSize: 10,
    color: Colors.textMuted,
    lineHeight: 12,
  },
});
