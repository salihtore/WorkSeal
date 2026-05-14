import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, FONTS, SPACING } from '@/constants/theme';
import Button from './Button';

interface EmptyStateProps {
  title?: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: string; // emoji or symbol character
}

export default function EmptyState({
  title,
  description,
  actionLabel,
  onAction,
  icon = '·',
}: EmptyStateProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.icon}>{icon}</Text>
      {title && <Text style={styles.title}>{title}</Text>}
      <Text style={styles.description}>{description}</Text>
      {actionLabel && onAction && (
        <Button onPress={onAction} variant="primary" size="md" style={styles.action}>
          {actionLabel}
        </Button>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 24,
  },
  icon: {
    fontSize: 64,
    fontWeight: '900',
    color: COLORS.border,
    marginBottom: SPACING.lg,
    fontFamily: FONTS.mono,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.foreground,
    marginBottom: 8,
    textAlign: 'center',
  },
  description: {
    fontFamily: FONTS.mono,
    fontSize: 12,
    color: COLORS.mutedForeground,
    textAlign: 'center',
    lineHeight: 18,
  },
  action: {
    marginTop: SPACING['2xl'],
    paddingHorizontal: 32,
  },
});
