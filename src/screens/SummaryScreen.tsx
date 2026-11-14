// Tela 6 – Resumo da semana (estatísticas simples)
import React, { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { isOverdue, useTasks } from '../context/TaskContext';
import { CATEGORIES, CATEGORY_LIST, colors, radius, spacing } from '../theme';
import { addDays, dayNumber, todayKey, weekdayShort } from '../utils/date';

export function SummaryScreen() {
  const { tasks } = useTasks();
  const today = todayKey();

  const stats = useMemo(() => {
    const days = Array.from({ length: 7 }, (_, i) => addDays(today, i - 6));
    const inWeek = tasks.filter((t) => t.date >= days[0] && t.date <= today);
    const done = inWeek.filter((t) => t.status === 'concluida').length;
    const pending = tasks.filter((t) => t.status === 'pendente' || isOverdue(t)).length;
    const upcoming = tasks.filter((t) => t.date > today && t.status !== 'concluida').length;
    const perDay = days.map((d) => {
      const list = tasks.filter((t) => t.date === d);
      return { date: d, total: list.length, done: list.filter((t) => t.status === 'concluida').length };
    });
    const perCategory = CATEGORY_LIST.map((c) => ({
      cat: c,
      total: inWeek.filter((t) => t.category === c).length,
      done: inWeek.filter((t) => t.category === c && t.status === 'concluida').length,
    }));
    const rate = inWeek.length ? Math.round((done / inWeek.length) * 100) : 0;
    const maxPerDay = Math.max(1, ...perDay.map((p) => p.total));
    return { inWeek: inWeek.length, done, pending, upcoming, perDay, perCategory, rate, maxPerDay };
  }, [tasks, today]);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={{ padding: spacing.lg, paddingBottom: 40 }}>
        <Text style={styles.title}>Resumo</Text>
        <Text style={styles.subtitle}>Últimos 7 dias</Text>

        <View style={styles.grid}>
          <StatCard icon="checkmark-done" color={colors.success} value={stats.done} label="Concluídas" />
          <StatCard icon="pie-chart-outline" color={colors.primary} value={`${stats.rate}%`} label="Taxa de conclusão" />
          <StatCard icon="alert-circle-outline" color={colors.warning} value={stats.pending} label="Pendentes" />
          <StatCard icon="calendar-outline" color="#8B5CF6" value={stats.upcoming} label="Próximas" />
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Tarefas por dia</Text>
          <View style={styles.chart}>
            {stats.perDay.map((p) => (
              <View key={p.date} style={styles.barCol}>
                <Text style={styles.barValue}>{p.total > 0 ? `${p.done}/${p.total}` : ''}</Text>
                <View style={styles.barTrack}>
                  <View style={[styles.barTotal, { height: `${(p.total / stats.maxPerDay) * 100}%` }]}>
                    <View style={[styles.barDone, { height: p.total ? `${(p.done / p.total) * 100}%` : 0 }]} />
                  </View>
                </View>
                <Text style={[styles.barLabel, p.date === today && { color: colors.primary, fontWeight: '800' }]}>
                  {p.date === today ? 'Hoje' : weekdayShort(p.date)}
                </Text>
                <Text style={styles.barSub}>{dayNumber(p.date)}</Text>
              </View>
            ))}
          </View>
          <View style={styles.legend}>
            <Legend color={colors.success} text="Concluídas" />
            <Legend color={colors.primaryLight} text="Total" />
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Por categoria</Text>
          {stats.perCategory.map(({ cat, total, done }) => {
            const info = CATEGORIES[cat];
            return (
              <View key={cat} style={styles.catRow}>
                <Ionicons name={info.icon} size={18} color={info.color} />
                <Text style={styles.catLabel}>{info.label}</Text>
                <View style={styles.catTrack}>
                  <View style={{ width: total ? `${(done / total) * 100}%` : 0, height: '100%', backgroundColor: info.color, borderRadius: 4 }} />
                </View>
                <Text style={styles.catCount}>
                  {done}/{total}
                </Text>
              </View>
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function StatCard({ icon, color, value, label }: { icon: keyof typeof Ionicons.glyphMap; color: string; value: string | number; label: string }) {
  return (
    <View style={styles.stat}>
      <Ionicons name={icon} size={22} color={color} />
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function Legend({ color, text }: { color: string; text: string }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
      <View style={{ width: 10, height: 10, borderRadius: 2, backgroundColor: color }} />
      <Text style={{ fontSize: 12, color: colors.textMuted }}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  title: { fontSize: 24, fontWeight: '800', color: colors.text },
  subtitle: { fontSize: 14, color: colors.textMuted, marginTop: 2 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginTop: spacing.lg },
  stat: { width: '48.5%', backgroundColor: colors.surface, borderRadius: radius.md, padding: spacing.lg },
  statValue: { fontSize: 26, fontWeight: '800', color: colors.text, marginTop: spacing.sm },
  statLabel: { fontSize: 13, color: colors.textMuted },
  card: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.lg, marginTop: spacing.lg },
  cardTitle: { fontSize: 16, fontWeight: '700', color: colors.text, marginBottom: spacing.md },
  chart: { flexDirection: 'row', justifyContent: 'space-between', height: 170 },
  barCol: { flex: 1, alignItems: 'center' },
  barValue: { fontSize: 10, color: colors.textMuted, height: 14 },
  barTrack: { flex: 1, width: 22, justifyContent: 'flex-end' },
  barTotal: { width: '100%', backgroundColor: colors.primaryLight, borderRadius: 6, justifyContent: 'flex-end', overflow: 'hidden' },
  barDone: { width: '100%', backgroundColor: colors.success },
  barLabel: { fontSize: 11, color: colors.textMuted, marginTop: 4 },
  barSub: { fontSize: 10, color: colors.textMuted },
  legend: { flexDirection: 'row', gap: spacing.lg, marginTop: spacing.md, justifyContent: 'center' },
  catRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingVertical: 6 },
  catLabel: { width: 110, fontSize: 14, color: colors.text },
  catTrack: { flex: 1, height: 8, backgroundColor: colors.background, borderRadius: 4, overflow: 'hidden' },
  catCount: { width: 36, textAlign: 'right', fontSize: 13, color: colors.textMuted },
});
