import { Borders, Colors, Radii, Spacing } from '@/constants/theme';
import React from 'react';
import { StyleSheet, View, type ViewStyle } from 'react-native';

interface NeoCardProps {
  children: React.ReactNode;
  color?: string;
  borderColor?: string;
  shadowColor?: string;
  style?: ViewStyle;
  offset?: boolean;
}

/**
 * Neo-brutalist card with thick border, solid fill, and optional offset shadow.
 */
export function NeoCard({ children, color, borderColor, shadowColor, style, offset = false }: NeoCardProps) {
  const bgColor = color || Colors.surface;
  const border = borderColor || (color ? Colors.black : Colors.border);
  const textOnLight = color && color !== Colors.surface;

  return (
    <View style={[styles.wrapper, style]}>
      {offset && (
        <View
          style={[
            styles.solidShadow,
            { backgroundColor: shadowColor || Colors.white, borderRadius: style?.borderRadius || Radii.md },
          ]}
        />
      )}
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
  solidShadow: {
    position: 'absolute',
    top: 6,
    left: 6,
    right: -6,
    bottom: -6,
    borderWidth: Borders.medium,
    borderColor: Colors.black,
  },
});
