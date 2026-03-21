import { NeoCard } from '@/components/ui/neo-card';
import { Colors, Fonts, FontSizes, Radii, Spacing } from '@/constants/theme';
import { TriangleAlert } from 'lucide-react-native';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface WarningBannerProps {
  message: string;
}

export function WarningBanner({ message }: WarningBannerProps) {
  return (
    <NeoCard style={styles.card} color="#DFFF00" offset={true}>
      <View style={styles.content}>
        <TriangleAlert size={24} color={Colors.black} strokeWidth={3} />
        <Text style={styles.message}>{message}</Text>
      </View>
    </NeoCard>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: Spacing.md,
    borderRadius: Radii.md,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.xs,
  },
  message: {
    flex: 1,
    fontFamily: Fonts.display,
    fontSize: FontSizes.md,
    color: Colors.black,
    fontWeight: '700',
    marginLeft: Spacing.md,
    textTransform: 'uppercase',
  },
});
