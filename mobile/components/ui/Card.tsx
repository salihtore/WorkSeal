import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { COLORS, RADIUS } from '@/constants/theme';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  noBorder?: boolean;
}

export default function Card({ children, style, noBorder = false }: CardProps) {
  return (
    <View style={[styles.card, noBorder && styles.noBorder, style]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS,
  },
  noBorder: {
    borderWidth: 0,
  },
});
