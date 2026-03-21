import { Borders, Colors, Fonts, FontSizes, Radii, Spacing } from '@/constants/theme';
import React, { useRef } from 'react';
import { Animated, Pressable, StyleSheet, Text, type TextStyle, type ViewStyle } from 'react-native';

interface NeoButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'outline' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  icon?: React.ReactNode;
}

export function NeoButton({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  style,
  textStyle,
  icon,
}: NeoButtonProps) {
  const scale = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scale, {
      toValue: 0.95,
      useNativeDriver: true,
      speed: 50,
      bounciness: 4,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
      speed: 50,
      bounciness: 4,
    }).start();
  };

  const bgColor =
    variant === 'primary' ? Colors.accent :
      variant === 'danger' ? Colors.exceeded :
        'transparent';

  const borderClr =
    variant === 'outline' ? Colors.white :
      variant === 'danger' ? Colors.exceeded :
        Colors.black;

  const textColor =
    variant === 'outline' ? Colors.white : Colors.white;

  const paddingV = size === 'sm' ? 10 : size === 'lg' ? 18 : 14;
  const fontSize = size === 'sm' ? FontSizes.md : size === 'lg' ? FontSizes.xl : FontSizes.lg;

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled}
        style={[
          styles.button,
          {
            backgroundColor: bgColor,
            borderColor: borderClr,
            paddingVertical: paddingV,
            opacity: disabled ? 0.5 : 1,
          },
          style,
        ]}
      >
        {icon && <>{icon}</>}
        <Text style={[styles.text, { color: textColor, fontSize }, textStyle]}>
          {title}
        </Text>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  button: {
    borderWidth: Borders.medium,
    borderRadius: Radii.md,
    paddingHorizontal: Spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
  },
  text: {
    fontFamily: Fonts.display,
    fontWeight: '700',
    textAlign: 'center',
  },
});
