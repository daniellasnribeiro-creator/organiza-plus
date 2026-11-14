import React from 'react';
import { Pressable, StyleSheet, Text, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, spacing } from '../theme';

interface Props {
  label: string;
  onPress: () => void;
  icon?: keyof typeof Ionicons.glyphMap;
  variant?: 'primary' | 'outline' | 'danger' | 'success' | 'warning';
  disabled?: boolean;
  style?: ViewStyle;
}

export function PrimaryButton({ label, onPress, icon, variant = 'primary', disabled, style }: Props) {
  const palette = {
    primary: { bg: colors.primary, fg: '#fff', border: colors.primary },
    outline: { bg: colors.surface, fg: colors.primary, border: colors.primary },
    danger: { bg: colors.dangerLight, fg: colors.danger, border: colors.dangerLight },
    success: { bg: colors.success, fg: '#fff', border: colors.success },
    warning: { bg: colors.warningLight, fg: colors.warning, border: colors.warningLight },
  }[variant];

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.btn,
        { backgroundColor: palette.bg, borderColor: palette.border },
        (pressed || disabled) && { opacity: disabled ? 0.5 : 0.85 },
        style,
      ]}
      accessibilityRole="button"
    >
      {icon && <Ionicons name={icon} size={18} color={palette.fg} />}
      <Text style={[styles.label, { color: palette.fg }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: 14,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.md,
    borderWidth: 1.5,
  },
  label: { fontSize: 15, fontWeight: '700' },
});
