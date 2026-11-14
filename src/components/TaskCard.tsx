import React from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Task } from '../types';
import { CATEGORIES, STATUS_INFO, colors, radius, spacing } from '../theme';
import { isOverdue, useTasks } from '../context/TaskContext';
import { friendlyDate } from '../utils/date';
import { runTaskAction } from '../utils/runTaskAction';

interface Props {
  task: Task;
  onPress: () => void;
  showDate?: boolean;
}

export function TaskCard({ task, onPress, showDate }: Props) {
  const { toggleComplete, markPending, rescheduleTomorrow, deleteTask } = useTasks();
  const cat = CATEGORIES[task.category];
  const done = task.status === 'concluida';
  const statusKey = isOverdue(task) ? 'atrasada' : task.status;
  const status = STATUS_INFO[statusKey];

  // Toque longo: ações rápidas
  const openActions = () => {
    Alert.alert(task.title, 'O que deseja fazer?', [
      { text: 'Deixar pendente', onPress: () => void runTaskAction(() => markPending(task.id), 'marcar a tarefa como pendente') },
      { text: 'Remarcar p/ amanhã', onPress: () => void runTaskAction(() => rescheduleTomorrow(task.id), 'remarcar a tarefa') },
      {
        text: 'Excluir',
        style: 'destructive',
        onPress: () => void runTaskAction(() => deleteTask(task.id), 'excluir a tarefa'),
      },
      { text: 'Cancelar', style: 'cancel' },
    ]);
  };

  return (
    <Pressable
      onPress={onPress}
      onLongPress={openActions}
      style={({ pressed }) => [styles.card, pressed && { opacity: 0.85 }]}
      accessibilityRole="button"
      accessibilityLabel={`${task.title}, ${status.label}`}
    >
      <View style={[styles.stripe, { backgroundColor: cat.color }]} />

      <Pressable
        onPress={() => void runTaskAction(() => toggleComplete(task.id), 'atualizar a tarefa')}
        hitSlop={10}
        style={[styles.check, done && { backgroundColor: colors.success, borderColor: colors.success }]}
        accessibilityRole="checkbox"
        accessibilityState={{ checked: done }}
      >
        {done && <Ionicons name="checkmark" size={18} color="#fff" />}
      </Pressable>

      <View style={styles.body}>
        <Text style={[styles.title, done && styles.titleDone]} numberOfLines={2}>
          {task.title}
        </Text>
        <View style={styles.metaRow}>
          <Ionicons name={cat.icon} size={14} color={cat.color} />
          <Text style={styles.meta}>{cat.label}</Text>
          {(task.time || showDate) && <Text style={styles.meta}>•</Text>}
          {showDate && <Text style={styles.meta}>{friendlyDate(task.date)}</Text>}
          {task.time && <Text style={styles.meta}>{task.time}</Text>}
          {task.reminder !== null && task.time && !done && (
            <Ionicons name="notifications-outline" size={13} color={colors.textMuted} />
          )}
        </View>
      </View>

      {task.status !== 'a_fazer' || statusKey === 'atrasada' ? (
        <View style={[styles.badge, { backgroundColor: status.bg }]}>
          <Text style={[styles.badgeText, { color: status.color }]}>{status.label}</Text>
        </View>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    paddingRight: spacing.md,
    marginBottom: spacing.sm,
    overflow: 'hidden',
    elevation: 1,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
  },
  stripe: { width: 4, alignSelf: 'stretch', marginRight: spacing.md },
  check: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  body: { flex: 1 },
  title: { fontSize: 16, fontWeight: '600', color: colors.text },
  titleDone: { textDecorationLine: 'line-through', color: colors.textMuted },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4, flexWrap: 'wrap' },
  meta: { fontSize: 13, color: colors.textMuted },
  badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: radius.pill, marginLeft: spacing.sm },
  badgeText: { fontSize: 11, fontWeight: '700' },
});
