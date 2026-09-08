import React from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  ViewStyle,
} from 'react-native';

import { colors, fonts, palette, radii, shadow, useTheme } from '@/theme';
import { haptics } from '@/lib/haptics';

// 'outline' adapts to the background: high-contrast burgundy on light surfaces,
// and cream when onDark={true}.
type Variant = 'primary' | 'secondary' | 'dark' | 'outline' | 'outlineAccent' | 'ghost';

interface Props {
  label: string;
  onPress?: () => void;
  variant?: Variant;
  loading?: boolean;
  disabled?: boolean;
  onDark?: boolean;
  size?: 'sm' | 'md' | 'lg';
  style?: ViewStyle;
}

export function Button({
  label,
  onPress,
  variant = 'primary',
  loading,
  disabled,
  onDark = false,
  size = 'md',
  style,
}: Props) {
  const { c, isDark } = useTheme();
  const isDisabled = disabled || loading;

  // Resolve background, border, and foreground based on variant and surface
  let bg: string = 'transparent';
  let borderCol: string = 'transparent';
  let borderWidth: number = 0;
  let fg: string = palette.cream;

  switch (variant) {
    case 'primary':
      bg = palette.burgundy;
      fg = palette.cream;
      borderWidth = 0;
      break;

    case 'secondary':
      bg = palette.gold;
      fg = palette.ink;
      borderWidth = 0;
      break;

    case 'dark':
      bg = palette.navy;
      fg = palette.cream;
      borderWidth = 0;
      break;

    case 'outline':
      if (onDark) {
        bg = 'rgba(245, 240, 230, 0.08)';
        borderCol = 'rgba(245, 240, 230, 0.75)';
        fg = palette.cream;
      } else {
        bg = isDark ? 'rgba(210, 105, 122, 0.08)' : 'rgba(128, 0, 32, 0.04)';
        borderCol = isDark ? c.accent : palette.burgundy;
        fg = isDark ? c.accent : palette.burgundy;
      }
      borderWidth = 1.5;
      break;

    case 'outlineAccent':
      bg = isDark ? 'rgba(210, 105, 122, 0.08)' : 'rgba(128, 0, 32, 0.04)';
      borderCol = c.accent;
      fg = c.accent;
      borderWidth = 1.5;
      break;

    case 'ghost':
      if (onDark) {
        bg = 'rgba(245, 240, 230, 0.12)';
        borderCol = 'rgba(245, 240, 230, 0.3)';
        fg = palette.cream;
        borderWidth = 1;
      } else {
        bg = isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(128, 0, 32, 0.06)';
        borderCol = isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(128, 0, 32, 0.18)';
        fg = isDark ? c.text : palette.burgundy;
        borderWidth = 1;
      }
      break;
  }

  const height = size === 'sm' ? 40 : size === 'lg' ? 56 : 50;
  const paddingHorizontal = size === 'sm' ? 14 : size === 'lg' ? 24 : 18;
  const fontSize = size === 'sm' ? 13 : size === 'lg' ? 16 : 15;

  return (
    <Pressable
      onPress={onPress}
      onPressIn={() => {
        if (!isDisabled) haptics.selection();
      }}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.base,
        {
          height,
          paddingHorizontal,
          backgroundColor: bg,
          borderColor: borderCol,
          borderWidth,
        },
        variant === 'primary' && !isDark && shadow.soft,
        pressed && !isDisabled && styles.pressed,
        isDisabled && styles.disabled,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={fg} />
      ) : (
        <Text style={[styles.label, { color: fg, fontSize }]}>{label}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: { opacity: 0.85, transform: [{ scale: 0.985 }] },
  disabled: { opacity: 0.45 },
  label: {
    fontFamily: fonts.bodySemibold,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});
