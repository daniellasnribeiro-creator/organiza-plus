// Tela 4 – Detalhes da tarefa (concluir, deixar pendente, remarcar, editar, excluir)
import React, { useLayoutEffect } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { isOverdue, useTasks } from '../context/TaskContext';
import { PrimaryButton } from '../components/PrimaryButton';
import { EmptyState } from '../components/EmptyState';
import { RootStackParamList } from '../navigation/types';
import { CATEGORIES, STATUS_INFO, colors, radius, spacing } from '../theme';
import { addDays, friendlyDate, longDate, todayKey } from '../utils/date';
import { runTaskAction } from '../utils/runTaskAction';

type Props = NativeStackScreenProps<RootStackParamList, 'DetalheTarefa'>;

export function TaskDetailScreen({ navigation, route }: Props) {
  const { getTask, toggleComplete, markPending, rescheduleTomorrow, rescheduleTo, deleteTask } = useTasks();
  const task = getTask(route.params.taskId);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () =>
        task ? (
          <Pressable onPress={() => navigation.navigate('FormTarefa', { taskId: task.id })} hitSlop={10}>
            <Ionicons name="create-outline" size={24} color={colors.primary} />
          </Pressable>
        ) : null,
    });
  }, [navigation, task]);

  if (!task) return <EmptyState icon="trash-outline" title="Tarefa não encontrada" subtitle="Ela pode ter sido excluída." />;

  const cat = CATEGORIES[task.category];
  const statusKey = isOverdue(task) ? 'atrasada' : task.status;
  const status = STATUS_INFO[statusKey];
  const done = task.status === 'concluida';
  const today = todayKey();
  const tomorrowLabel = friendlyDate(addDays(task.date < today ? today : task.date, 1));

  const confirmDelete = () =>
    Alert.alert('Excluir tarefa', `Deseja excluir "${task.title}"?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Excluir',
        style: 'destructive',
        onPress: () =>
          void runTaskAction(async () => {
            await deleteTask(task.id);
            navigation.goBack();
          }, 'excluir a tarefa'),
      },
    ]);

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: spacing.lg, paddingBottom: 40 }}>
      <View style={styles.card}>
        <View style={[styles.catPill, { backgroundColor: cat.color + '22' }]}>
          <Ionicons name={cat.icon} size={16} color={cat.color} />
          <Text style={[styles.catText, { color: cat.color }]}>{cat.label}</Text>
        </View>
        <Text style={[styles.title, done && styles.titleDone]}>{task.title}</Text>

        <View style={[styles.status, { backgroundColor: status.bg }]}>
          <Text style={{ color: status.color, fontWeight: '700' }}>{status.label}</Text>
        </View>

        <InfoRow icon="calendar-outline" text={longDate(task.date)} />
        <InfoRow icon="time-outline" text={task.time ?? 'Sem horário definido'} />
        <InfoRow
          icon="notifications-outline"
          text={
            task.reminder === null || !task.time
              ? 'Sem lembrete'
              : task.reminder === 0
                ? 'Lembrete na hora'
                : `Lembrete ${task.reminder === 60 ? '1 hora' : task.reminder + ' min'} antes`
          }
        />
        {task.rescheduledCount > 0 && (
          <InfoRow icon="refresh-outline" text={`Remarcada ${task.rescheduledCount}x`} />
        )}
        {!!task.notes && (
          <View style={styles.notes}>
            <Text style={styles.notesLabel}>Observações</Text>
            <Text style={styles.notesText}>{task.notes}</Text>
          </View>
        )}
      </View>

      <View style={{ gap: spacing.sm, marginTop: spacing.lg }}>
        <PrimaryButton
          label={done ? 'Desmarcar conclusão' : 'Marcar como concluída'}
          icon={done ? 'arrow-undo-outline' : 'checkmark-circle-outline'}
          variant={done ? 'outline' : 'success'}
          onPress={() => void runTaskAction(() => toggleComplete(task.id), 'atualizar a tarefa')}
        />
        {!done && task.status !== 'pendente' && (
          <PrimaryButton label="Não consegui – deixar pendente" icon="pause-circle-outline" variant="warning" onPress={() => void runTaskAction(() => markPending(task.id), 'marcar a tarefa como pendente')} />
        )}
        {!done && (
          <PrimaryButton label={`Remarcar para ${tomorrowLabel.toLowerCase()}`} icon="arrow-redo-outline" variant="outline" onPress={() => void runTaskAction(() => rescheduleTomorrow(task.id), 'remarcar a tarefa')} />
        )}
        {!done && task.date !== today && (
          <PrimaryButton label="Trazer para hoje" icon="today-outline" variant="outline" onPress={() => void runTaskAction(() => rescheduleTo(task.id, today), 'remarcar a tarefa')} />
        )}
        <PrimaryButton label="Excluir tarefa" icon="trash-outline" variant="danger" onPress={confirmDelete} />
      </View>
    </ScrollView>
  );
}

function InfoRow({ icon, text }: { icon: keyof typeof Ionicons.glyphMap; text: string }) {
  return (
    <View style={styles.infoRow}>
      <Ionicons name={icon} size={18} color={colors.textMuted} />
      <Text style={styles.infoText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  card: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.lg },
  catPill: {
    flexDirection: 'row',
    alignSelf: 'flex-start',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: spacing.md,
    paddingVertical: 4,
    borderRadius: radius.pill,
  },
  catText: { fontWeight: '700', fontSize: 13 },
  title: { fontSize: 22, fontWeight: '800', color: colors.text, marginTop: spacing.md },
  titleDone: { textDecorationLine: 'line-through', color: colors.textMuted },
  status: { alignSelf: 'flex-start', paddingHorizontal: spacing.md, paddingVertical: 4, borderRadius: radius.pill, marginVertical: spacing.md },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingVertical: 6 },
  infoText: { fontSize: 15, color: colors.text, textTransform: 'none' },
  notes: { marginTop: spacing.md, padding: spacing.md, backgroundColor: colors.background, borderRadius: radius.md },
  notesLabel: { fontSize: 12, fontWeight: '700', color: colors.textMuted, marginBottom: 4 },
  notesText: { fontSize: 15, color: colors.text },
});
