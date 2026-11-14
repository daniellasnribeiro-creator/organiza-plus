// Tela 3 – Nova tarefa / Editar tarefa
import React, { useLayoutEffect, useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTasks } from '../context/TaskContext';
import { DateTimeField } from '../components/DateTimeField';
import { PrimaryButton } from '../components/PrimaryButton';
import { RootStackParamList } from '../navigation/types';
import { CATEGORIES, CATEGORY_LIST, colors, radius, spacing } from '../theme';
import { Category, ReminderOption } from '../types';
import { combineDateTime, friendlyDate, fromDateKey, toDateKey, toTimeKey, todayKey } from '../utils/date';

type Props = NativeStackScreenProps<RootStackParamList, 'FormTarefa'>;

/** Próxima hora cheia (se a data for hoje) ou 09:00 (outros dias). */
function suggestedTime(dateKey: string): string {
  if (dateKey !== todayKey()) return '09:00';
  const next = new Date();
  next.setHours(Math.min(next.getHours() + 1, 23), 0, 0, 0);
  return toTimeKey(next);
}

const REMINDERS: { value: ReminderOption; label: string }[] = [
  { value: null, label: 'Sem lembrete' },
  { value: 0, label: 'Na hora' },
  { value: 15, label: '15 min antes' },
  { value: 60, label: '1 h antes' },
];

export function TaskFormScreen({ navigation, route }: Props) {
  const { addTask, updateTask, getTask } = useTasks();
  const editing = route.params?.taskId ? getTask(route.params.taskId) : undefined;

  const [title, setTitle] = useState(editing?.title ?? '');
  const [category, setCategory] = useState<Category>(editing?.category ?? 'pessoal');
  const [date, setDate] = useState(editing?.date ?? route.params?.date ?? todayKey());
  const [time, setTime] = useState<string | null>(editing?.time ?? null);
  const [notes, setNotes] = useState(editing?.notes ?? '');
  const [reminder, setReminder] = useState<ReminderOption>(editing?.reminder ?? null);
  const [error, setError] = useState('');

  useLayoutEffect(() => {
    navigation.setOptions({ title: editing ? 'Editar tarefa' : 'Nova tarefa' });
  }, [navigation, editing]);

  const save = async () => {
    // Validações
    if (title.trim().length < 3) {
      setError('O título precisa ter pelo menos 3 caracteres.');
      return;
    }
    if (reminder !== null && !time) {
      setError('Para receber lembrete, defina um horário.');
      return;
    }
    const input = { title: title.trim(), category, date, time, notes: notes.trim(), reminder };

    const doSave = async () => {
      try {
        if (editing) await updateTask(editing.id, input);
        else await addTask(input);
        navigation.goBack();
      } catch (error) {
        console.error('Erro ao salvar tarefa', error);
        setError('Não foi possível salvar a tarefa. Verifique sua conexão e tente novamente.');
      }
    };

    // Aviso se o horário já passou
    if (time && combineDateTime(date, time).getTime() < Date.now() && !editing) {
      Alert.alert('Horário no passado', 'A data/horário escolhidos já passaram. Salvar mesmo assim?', [
        { text: 'Corrigir', style: 'cancel' },
        { text: 'Salvar', onPress: doSave },
      ]);
      return;
    }
    await doSave();
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView style={styles.container} contentContainerStyle={{ padding: spacing.lg, paddingBottom: 40 }} keyboardShouldPersistTaps="handled">
        <Text style={styles.label}>Título *</Text>
        <TextInput
          value={title}
          onChangeText={(t) => {
            setTitle(t);
            setError('');
          }}
          placeholder="Ex.: Consulta no cardiologista"
          placeholderTextColor={colors.textMuted}
          style={[styles.input, !!error && title.trim().length < 3 && { borderColor: colors.danger }]}
          maxLength={60}
          autoFocus={!editing}
        />

        <Text style={[styles.label, styles.mt]}>Categoria</Text>
        <View style={styles.wrap}>
          {CATEGORY_LIST.map((c) => {
            const info = CATEGORIES[c];
            const sel = c === category;
            return (
              <Pressable
                key={c}
                onPress={() => setCategory(c)}
                style={[styles.catChip, { borderColor: info.color }, sel && { backgroundColor: info.color }]}
              >
                <Ionicons name={info.icon} size={16} color={sel ? '#fff' : info.color} />
                <Text style={[styles.catText, { color: sel ? '#fff' : info.color }]}>{info.label}</Text>
              </Pressable>
            );
          })}
        </View>

        <View style={[styles.row, styles.mt]}>
          <DateTimeField
            mode="date"
            label="Data"
            value={fromDateKey(date)}
            display={friendlyDate(date)}
            onChange={(d) => setDate(toDateKey(d))}
          />
          <DateTimeField
            mode="time"
            label="Horário"
            value={combineDateTime(date, time ?? '09:00')}
            display={time ?? 'Sem horário'}
            onChange={(d) => {
              setTime(toTimeKey(d));
              setError('');
            }}
            onClear={
              time
                ? () => {
                    setTime(null);
                    setReminder(null);
                  }
                : undefined
            }
          />
        </View>

        <Text style={[styles.label, styles.mt]}>Lembrete</Text>
        <View style={styles.wrap}>
          {REMINDERS.map((r) => {
            const sel = r.value === reminder;
            const needsTime = r.value !== null && !time;
            return (
              <Pressable
                key={String(r.value)}
                onPress={() => {
                  // Lembrete precisa de horário: se ainda não houver, sugere a próxima hora cheia
                  if (needsTime) setTime(suggestedTime(date));
                  setReminder(r.value);
                  setError('');
                }}
                style={[styles.chip, sel && styles.chipSel, needsTime && { opacity: 0.6 }]}
                accessibilityRole="button"
                accessibilityState={{ selected: sel }}
              >
                <Text style={[styles.chipText, sel && { color: '#fff' }]}>{r.label}</Text>
              </Pressable>
            );
          })}
        </View>
        {!time && <Text style={styles.hint}>Ao escolher um lembrete sem horário, o app sugere a próxima hora cheia (você pode alterar em Horário).</Text>}

        <Text style={[styles.label, styles.mt]}>Observações</Text>
        <TextInput
          value={notes}
          onChangeText={setNotes}
          placeholder="Endereço, o que levar, detalhes..."
          placeholderTextColor={colors.textMuted}
          style={[styles.input, { minHeight: 90, textAlignVertical: 'top' }]}
          multiline
          maxLength={300}
        />

        {!!error && (
          <View style={styles.errorBox}>
            <Ionicons name="alert-circle" size={18} color={colors.danger} />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        <PrimaryButton
          label={editing ? 'Salvar alterações' : 'Adicionar tarefa'}
          icon="checkmark"
          onPress={save}
          style={{ marginTop: spacing.xl }}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  label: { fontSize: 14, fontWeight: '600', color: colors.text, marginBottom: spacing.sm },
  mt: { marginTop: spacing.lg },
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.md,
    fontSize: 16,
    color: colors.text,
  },
  row: { flexDirection: 'row', gap: spacing.md },
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  catChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    borderRadius: radius.pill,
    borderWidth: 1.5,
    backgroundColor: colors.surface,
  },
  catText: { fontSize: 13, fontWeight: '600' },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipSel: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { fontSize: 13, fontWeight: '600', color: colors.text },
  hint: { fontSize: 12, color: colors.textMuted, marginTop: spacing.xs },
  errorBox: {
    flexDirection: 'row',
    gap: spacing.sm,
    alignItems: 'center',
    backgroundColor: colors.dangerLight,
    padding: spacing.md,
    borderRadius: radius.md,
    marginTop: spacing.lg,
  },
  errorText: { color: colors.danger, flex: 1, fontSize: 13, fontWeight: '600' },
});
