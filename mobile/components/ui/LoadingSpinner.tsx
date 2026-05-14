import React from 'react';
import { ActivityIndicator, View, Text, StyleSheet } from 'react-native';
import { COLORS, FONTS } from '@/constants/theme';

interface Props {
  label?: string;
  size?: number;
  color?: string;
}

export default function LoadingSpinner({ label, size = 24, color = COLORS.primary }: Props) {
  return (
    <View style={styles.container}>
      <ActivityIndicator size={size} color={color} />
      {label && <Text style={styles.label}>{label}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingVertical: 60,
  },
  label: {
    fontFamily: FONTS.mono,
    fontSize: 10,
    color: COLORS.mutedForeground,
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
});
