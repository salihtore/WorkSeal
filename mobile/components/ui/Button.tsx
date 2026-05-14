import React from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  StyleSheet,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { COLORS, FONTS, RADIUS, SPACING } from '@/constants/theme';

type Variant = 'primary' | 'outline' | 'ghost' | 'destructive' | 'emerald' | 'yellow';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps {
  onPress: () => void;
  children: React.ReactNode;
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  fullWidth?: boolean;
}

const variantStyles: Record<Variant, { container: ViewStyle; text: TextStyle }> = {
  primary: {
    container: { backgroundColor: COLORS.primary },
    text: { color: COLORS.primaryForeground, fontWeight: '700' },
  },
  outline: {
    container: {
      backgroundColor: 'transparent',
      borderWidth: 1,
      borderColor: COLORS.border,
    },
    text: { color: COLORS.foreground, fontWeight: '600' },
  },
  ghost: {
    container: { backgroundColor: 'transparent' },
    text: { color: COLORS.mutedForeground, fontWeight: '500' },
  },
  destructive: {
    container: {
      backgroundColor: 'transparent',
      borderWidth: 1,
      borderColor: 'rgba(248,113,113,0.5)',
    },
    text: { color: COLORS.destructive, fontWeight: '700' },
  },
  emerald: {
    container: { backgroundColor: COLORS.emerald },
    text: { color: COLORS.primaryForeground, fontWeight: '700' },
  },
  yellow: {
    container: { backgroundColor: '#CA8A04' },
    text: { color: COLORS.primaryForeground, fontWeight: '700' },
  },
};

const sizeStyles: Record<Size, { container: ViewStyle; text: TextStyle }> = {
  sm: {
    container: { paddingHorizontal: SPACING.md, paddingVertical: SPACING.xs, height: 34 },
    text: { fontSize: 11 },
  },
  md: {
    container: { paddingHorizontal: SPACING.xl, paddingVertical: SPACING.sm, height: 40 },
    text: { fontSize: 13 },
  },
  lg: {
    container: { paddingHorizontal: SPACING['2xl'], paddingVertical: SPACING.md, height: 48 },
    text: { fontSize: 15 },
  },
};

export default function Button({
  onPress,
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  style,
  textStyle,
  fullWidth = false,
}: ButtonProps) {
  const vs = variantStyles[variant];
  const ss = sizeStyles[size];

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.75}
      style={[
        styles.base,
        vs.container,
        ss.container,
        fullWidth && { width: '100%' },
        (disabled || loading) && styles.disabled,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'primary' || variant === 'emerald' || variant === 'yellow'
            ? COLORS.primaryForeground
            : COLORS.primary}
        />
      ) : (
        <Text
          style={[styles.text, vs.text, ss.text, textStyle]}
          numberOfLines={1}
        >
          {children}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: RADIUS,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  text: {
    fontFamily: FONTS.sans,
    letterSpacing: 0.5,
  },
  disabled: {
    opacity: 0.5,
  },
});
