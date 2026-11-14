// Tela 2 – Hoje (lista de tarefas do dia selecionado)
import React, { useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { isOverdue, sortByTime, useTasks } from '../context/TaskContext';
import { TaskCard } from '../components/TaskCard';
import { DateStrip } from '../components/DateStrip';
import { EmptyState } from '../components/EmptyState';
import { RootStackParamList } from '../navigation/types';
import { colors, radius, spacing } from '../theme';
import { greeting, longDate, todayKey } from '../utils/date';

type Nav = NativeStackNavigationProp<RootStackParamList>;
type Filter = 'todas' | 'a_fazer' | 'concluida';

export function HomeScreen() {
  const navigation = useNavigation<Nav>();
  const { tasks, user } = useTasks();
  const [selectedDate, setSelectedDate] = useState(todayKey());
  const [filter, setFilter] = useState<Filter>('todas');

  const datesWithTasks = useMemo(() => new Set(tasks.map((t) => t.date)), [tasks]);
  const overdueCount = useMemo(() => tasks.filter((t) => isOverdue(t) || t.status === 'pendente').length, [tasks]);

  const dayTasks = useMemo(() => tasks.filter((t) => t.date === selectedDate).sort(sortByTime), [tasks, selectedDate]);
  const doneCount = dayTasks.filter((t) => t.status === 'concluida').length;
  const progress = dayTasks.length ? doneCount / dayTasks.length : 0;

  const visible = dayTasks.filter((t) => {
    if (filter === 'todas') return true;
    if (filter === 'concluida') return t.status === 'concluida';
    return t.status !== 'concluida';
  });

  const header = (
    <View>
      <View style={styles.top}>
        <Text style={styles.hello}>
          {greeting()}, {user?.name?.split(' ')[0]} 👋
        </Text>
        <Text style={styles.date}>{longDate(selectedDate)}</Text>
      </View>

      <DateStrip selected={selectedDate} onSelect={setSelectedDate} datesWithTasks={datesWithTasks} />

      <View style={styles.progressCard}>
        <View style={{ flex: 1 }}>
          <Text style={styles.progressTitle}>
            {dayTasks.length === 0
              ? 'Nenhuma tarefa neste dia'
              : `${doneCount} de ${dayTasks.length} tarefas concluídas`}
          </Text>
          <View style={styles.barBg}>
            <View style={[styles.barFill, { width: `${Math.round(progress * 100)}%` }]} />
          </View>
        </View>
        <Text style={styles.percent}>{Math.round(progress * 100)}%</Text>
      </View>

      {overdueCount > 0 && (
        <Pressable style={styles.alert} onPress={() => navigation.navigate('Abas', { screen: 'Pendentes' })}>
          <Ionicons name="alert-circle" size={20} color={colors.warning} />
          <Text style={styles.alertText}>
            Você tem {overdueCount} {overdueCount === 1 ? 'tarefa pendente' : 'tarefas pendentes'}. Toque para reorganizar.
          </Text>
          <Ionicons name="chevron-forward" size={18} color={colors.warning} />
        </Pressable>
      )}

      <View style={styles.filters}>
        {(
          [
            ['todas', 'Todas'],
            ['a_fazer', 'A fazer'],
            ['concluida', 'Concluídas'],
          ] as [Filter, string][]
        ).map(([key, label]) => (
          <Pressable key={key} onPress={() => setFilter(key)} style={[styles.chip, filter === key && styles.chipSel]}>
            <Text style={[styles.chipText, filter === key && { color: '#fff' }]}>{label}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <FlatList
        data={visible}
        keyExtractor={(t) => t.id}
        ListHeaderComponent={header}
        renderItem={({ item }) => (
          <View style={{ paddingHorizontal: spacing.lg }}>
            <TaskCard task={item} onPress={() => navigation.navigate('DetalheTarefa', { taskId: item.id })} />
          </View>
        )}
        ListEmptyComponent={
          <EmptyState
            icon="calendar-clear-outline"
            title={filter === 'todas' ? 'Dia livre!' : 'Nada por aqui'}
            subtitle={filter === 'todas' ? 'Toque no botão + para adicionar uma tarefa.' : 'Experimente outro filtro.'}
          />
        }
        contentContainerStyle={{ paddingBottom: 100 }}
      />

      <Pressable
        style={({ pressed }) => [styles.fab, pressed && { transform: [{ scale: 0.95 }] }]}
        onPress={() => navigation.navigate('FormTarefa', { date: selectedDate })}
        accessibilityLabel="Adicionar tarefa"
      >
        <Ionicons name="add" size={32} color="#fff" />
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  top: { paddingHorizontal: spacing.lg, paddingTop: spacing.md, paddingBottom: spacing.md },
  hello: { fontSize: 24, fontWeight: '800', color: colors.text },
  date: { fontSize: 14, color: colors.textMuted, marginTop: 2, },
  progressCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    margin: spacing.lg,
    padding: spacing.lg,
    borderRadius: radius.lg,
    gap: spacing.md,
  },
  progressTitle: { color: '#fff', fontSize: 15, fontWeight: '600' },
  barBg: { height: 8, borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.3)', marginTop: spacing.sm },
  barFill: { height: 8, borderRadius: 4, backgroundColor: '#fff' },
  percent: { color: '#fff', fontSize: 22, fontWeight: '800' },
  alert: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.warningLight,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    padding: spacing.md,
    borderRadius: radius.md,
  },
  alertText: { flex: 1, color: '#92400E', fontSize: 13, fontWeight: '600' },
  filters: { flexDirection: 'row', gap: spacing.sm, paddingHorizontal: spacing.lg, marginBottom: spacing.md },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipSel: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { fontSize: 13, fontWeight: '600', color: colors.text },
  fab: {
    position: 'absolute',
    right: spacing.xl,
    bottom: spacing.xl,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
    shadowColor: colors.primary,
    shadowOpacity: 0.4,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
});
