import React from 'react';
import {
  TextInput,
  View,
  Text,
  StyleSheet,
  TextInputProps,
  ViewStyle,
} from 'react-native';
import { COLORS, FONTS, RADIUS, SPACING } from '@/constants/theme';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  containerStyle?: ViewStyle;
  mono?: boolean;
}

export default function Input({ label, error, containerStyle, mono, style, ...props }: InputProps) {
  return (
    <View style={[styles.container, containerStyle]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <TextInput
        style={[
          styles.input,
          mono && styles.inputMono,
          error && styles.inputError,
          style as any,
        ]}
        placeholderTextColor={COLORS.mutedForeground}
        selectionColor={COLORS.primary}
        {...props}
      />
      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
}

interface TextareaProps extends TextInputProps {
  label?: string;
  error?: string;
  containerStyle?: ViewStyle;
  rows?: number;
}

export function Textarea({ label, error, containerStyle, rows = 4, style, ...props }: TextareaProps) {
  return (
    <View style={[styles.container, containerStyle]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <TextInput
        style={[
          styles.input,
          styles.textarea,
          { minHeight: rows * 22 },
          error && styles.inputError,
          style as any,
        ]}
        placeholderTextColor={COLORS.mutedForeground}
        selectionColor={COLORS.primary}
        multiline
        textAlignVertical="top"
        {...props}
      />
      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: SPACING.xs,
  },
  label: {
    fontFamily: FONTS.mono,
    fontSize: 10,
    color: COLORS.mutedForeground,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginBottom: 4,
  },
  input: {
    backgroundColor: COLORS.input,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS,
    paddingHorizontal: SPACING.base,
    paddingVertical: SPACING.sm,
    height: 44,
    color: COLORS.foreground,
    fontFamily: FONTS.sans,
    fontSize: 14,
  },
  inputMono: {
    fontFamily: FONTS.mono,
    fontSize: 12,
  },
  textarea: {
    height: 'auto',
    paddingTop: SPACING.md,
    paddingBottom: SPACING.md,
  },
  inputError: {
    borderColor: COLORS.destructive,
  },
  error: {
    fontFamily: FONTS.mono,
    fontSize: 10,
    color: COLORS.destructive,
    marginTop: 2,
  },
});
