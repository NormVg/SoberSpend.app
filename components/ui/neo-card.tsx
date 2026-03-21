import { Borders, Colors, Radii, Spacing } from '@/constants/theme';
import React from 'react';
import { StyleSheet, View, type ViewStyle } from 'react-native';

interface NeoCardProps {
  children: React.ReactNode;
  color?: string;
  borderColor?: string;
  style?: ViewStyle;
  offset?: boolean;
}

/**
 * Neo-brutalist card with thick border, solid fill, and optional offset shadow.
 */
export function NeoCard({ children, color, borderColor, style, offset = false }: NeoCardProps) {
  const bgColor = color || Colors.surface;
  const border = borderColor || (color ? Colors.black : Colors.border);
  const textOnLight = color && color !== Colors.surface;

  return (
    <View style={[styles.wrapper, style, offset && styles.shadow]}>
      <View
        style={[
          styles.card,
          {
            backgroundColor: bgColor,
            borderColor: border,
          },
        ]}
      >
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'relative',
  },
  card: {
    borderWidth: Borders.medium,
    borderRadius: Radii.md,
    padding: Spacing.md,
    overflow: 'hidden',
  },
  shadow: {
    shadowColor: Colors.black,
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 6,
  },
});
