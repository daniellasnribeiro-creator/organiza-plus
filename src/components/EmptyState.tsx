import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing } from '../theme';

interface Props {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle?: string;
}

export function EmptyState({ icon, title, subtitle }: Props) {
  return (
    <View style={styles.box}>
      <Ionicons name={icon} size={48} color={colors.border} />
      <Text style={styles.title}>{title}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  box: { alignItems: 'center', paddingVertical: spacing.xl * 2, paddingHorizontal: spacing.xl },
  title: { fontSize: 16, fontWeight: '600', color: colors.text, marginTop: spacing.md, textAlign: 'center' },
  subtitle: { fontSize: 14, color: colors.textMuted, marginTop: spacing.xs, textAlign: 'center' },
});
