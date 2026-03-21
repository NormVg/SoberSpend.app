import { NeoButton } from '@/components/ui/neo-button';
import { NeoCard } from '@/components/ui/neo-card';
import { Borders, Colors, Fonts, FontSizes, Radii, Spacing } from '@/constants/theme';
import { Gamepad2, ShoppingCart, Utensils } from 'lucide-react-native';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

const truthData = [
  {
    id: '1',
    name: 'DINING OUT',
    icon: Utensils,
    color: '#FF85A2',
    spent: '$452.12',
    trend: '+22% THIS MONTH',
    trendColor: '#FF85A2',
  },
  {
    id: '2',
    name: 'ENTERTAINMENT',
    icon: Gamepad2,
    color: '#00FFFF',
    spent: '$120.00',
    trend: '-5% THIS MONTH',
    trendColor: '#00FFFF',
  },
  {
    id: '3',
    name: 'GROCERIES',
    icon: ShoppingCart,
    color: '#DFFF00',
    spent: '$215.80',
    trend: 'ON TRACK',
    trendColor: Colors.black,
  },
];

export function HardTruthCard() {
  return (
    <NeoCard style={styles.card} color={Colors.white} offset={true}>
      <Text style={styles.title}>THE HARD TRUTH</Text>

      <View style={styles.list}>
        {truthData.map((item, index) => {
          const isLast = index === truthData.length - 1;
          const Icon = item.icon;

          return (
            <View key={item.id} style={[styles.row, !isLast && styles.rowBorder]}>
              <View style={styles.left}>
                <View style={[styles.iconBox, { backgroundColor: item.color }]}>
                  <Icon size={16} color={Colors.black} strokeWidth={2.5} />
                </View>
                <Text style={styles.name}>{item.name}</Text>
              </View>

              <View style={styles.right}>
                <Text style={styles.spent}>{item.spent}</Text>
                <Text style={[styles.trend, { color: item.trendColor }]}>{item.trend}</Text>
              </View>
            </View>
          );
        })}
      </View>

      <View style={styles.buttonContainer}>
        <NeoButton
          title="VIEW ALL TRANSACTIONS"
          variant="primary"
          style={{ backgroundColor: Colors.black }}
          textStyle={{ color: Colors.white }}
          onPress={() => { }}
        />
      </View>
    </NeoCard>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: Spacing.xxl,
  },
  title: {
    fontFamily: Fonts.display,
    fontSize: 24,
    color: Colors.black,
    lineHeight: 24,
    marginBottom: Spacing.md,
  },
  list: {
    marginBottom: Spacing.lg,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
  },
  rowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
    borderStyle: 'dashed',
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconBox: {
    width: 32,
    height: 32,
    borderRadius: Radii.sm,
    borderWidth: Borders.thin,
    borderColor: Colors.black,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  name: {
    fontFamily: Fonts.display,
    fontSize: FontSizes.sm,
    color: Colors.black,
    fontWeight: '700',
  },
  right: {
    alignItems: 'flex-end',
  },
  spent: {
    fontFamily: Fonts.display,
    fontSize: FontSizes.md,
    color: Colors.black,
    fontWeight: '700',
    marginBottom: 2,
  },
  trend: {
    fontFamily: Fonts.display,
    fontSize: 8,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  buttonContainer: {
    marginTop: Spacing.xs,
  },
});
