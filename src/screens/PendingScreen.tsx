// Tela 5 – Pendentes (tarefas atrasadas ou deixadas como pendentes)
import React, { useMemo } from 'react';
import { Alert, FlatList, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { isOverdue, sortByTime, useTasks } from '../context/TaskContext';
import { TaskCard } from '../components/TaskCard';
import { EmptyState } from '../components/EmptyState';
import { PrimaryButton } from '../components/PrimaryButton';
import { RootStackParamList } from '../navigation/types';
import { colors, spacing } from '../theme';
import { todayKey } from '../utils/date';
import { runTaskAction } from '../utils/runTaskAction';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export function PendingScreen() {
  const navigation = useNavigation<Nav>();
  const { tasks, rescheduleTo, rescheduleTomorrow } = useTasks();

  const pending = useMemo(
    () => tasks.filter((t) => t.status === 'pendente' || isOverdue(t)).sort(sortByTime),
    [tasks]
  );

  const moveAll = (target: 'hoje' | 'amanha') => {
    Alert.alert(
      'Remarcar todas',
      `Mover ${pending.length} ${pending.length === 1 ? 'tarefa' : 'tarefas'} para ${target === 'hoje' ? 'hoje' : 'amanhã'}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Confirmar',
          onPress: () => {
            void runTaskAction(async () => {
              for (const t of pending) {
                if (target === 'hoje') await rescheduleTo(t.id, todayKey());
                else await rescheduleTomorrow(t.id);
              }
            }, 'remarcar as tarefas');
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <FlatList
        data={pending}
        keyExtractor={(t) => t.id}
        contentContainerStyle={{ padding: spacing.lg, paddingBottom: 40 }}
        ListHeaderComponent={
          <View style={{ marginBottom: spacing.lg }}>
            <Text style={styles.title}>Pendentes</Text>
            <Text style={styles.subtitle}>
              Tarefas que ficaram para trás. Conclua, traga para hoje ou remarque para amanhã.
            </Text>
            {pending.length > 0 && (
              <View style={styles.actions}>
                <PrimaryButton label="Tudo p/ hoje" icon="today-outline" variant="outline" onPress={() => moveAll('hoje')} style={{ flex: 1 }} />
                <PrimaryButton label="Tudo p/ amanhã" icon="arrow-redo-outline" onPress={() => moveAll('amanha')} style={{ flex: 1 }} />
              </View>
            )}
          </View>
        }
        renderItem={({ item }) => (
          <TaskCard task={item} showDate onPress={() => navigation.navigate('DetalheTarefa', { taskId: item.id })} />
        )}
        ListEmptyComponent={<EmptyState icon="happy-outline" title="Tudo em dia!" subtitle="Você não tem tarefas pendentes." />}
        ListFooterComponent={
          pending.length > 0 ? <Text style={styles.tip}>Dica: segure uma tarefa para ver ações rápidas.</Text> : undefined
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  title: { fontSize: 24, fontWeight: '800', color: colors.text },
  subtitle: { fontSize: 14, color: colors.textMuted, marginTop: 4 },
  actions: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.lg },
  tip: { fontSize: 12, color: colors.textMuted, textAlign: 'center', marginTop: spacing.md },
});
