import React from 'react';
import { Text, View, StyleSheet } from 'react-native';
import { COLORS, FONTS, RADIUS } from '@/constants/theme';
import { ContractStatus, getStatusColor, getStatusLabel } from '@/types';

interface StatusBadgeProps {
  status: ContractStatus;
  size?: 'sm' | 'md';
}

export default function StatusBadge({ status, size = 'sm' }: StatusBadgeProps) {
  const colors = getStatusColor(status);
  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: colors.bg,
          borderColor: colors.border,
        },
        size === 'md' && styles.badgeMd,
      ]}
    >
      <Text
        style={[
          styles.text,
          { color: colors.text },
          size === 'md' && styles.textMd,
        ]}
        numberOfLines={1}
      >
        {getStatusLabel(status).toUpperCase()}
      </Text>
    </View>
  );
}

interface GenericBadgeProps {
  label: string;
  color?: string;
  bg?: string;
  border?: string;
  size?: 'sm' | 'md';
}

export function Badge({ label, color, bg, border, size = 'sm' }: GenericBadgeProps) {
  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: bg || COLORS.secondary,
          borderColor: border || COLORS.border,
        },
        size === 'md' && styles.badgeMd,
      ]}
    >
      <Text
        style={[
          styles.text,
          { color: color || COLORS.mutedForeground },
          size === 'md' && styles.textMd,
        ]}
        numberOfLines={1}
      >
        {label.toUpperCase()}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    borderWidth: 1,
    borderRadius: RADIUS,
    paddingHorizontal: 8,
    paddingVertical: 3,
    alignSelf: 'flex-start',
  },
  badgeMd: {
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  text: {
    fontFamily: FONTS.mono,
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 1,
  },
  textMd: {
    fontSize: 10,
  },
});
