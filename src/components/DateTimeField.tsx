// Campo de data/horário que funciona em Android, iPhone e Web.
// - Android: abre o seletor nativo em uma janela (DateTimePickerAndroid).
// - iPhone: abre uma janela inferior (Modal) com o seletor e os botões Cancelar / OK.
// - Web: usa o seletor do próprio navegador (<input type="date"> / <input type="time">).
import React, { useState } from 'react';
import { Modal, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import DateTimePicker, { DateTimePickerAndroid, DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, spacing } from '../theme';

interface Props {
  mode: 'date' | 'time';
  value: Date;
  label: string;
  display: string;
  onChange: (d: Date) => void;
  onClear?: () => void;
}

const pad = (n: number) => String(n).padStart(2, '0');

/** Mantém só o dia escolhido, ao meio-dia local (evita trocar de dia por causa do fuso). */
function localNoon(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 12);
}

/** No Android o seletor de data devolve o dia em UTC; converte para o dia local. */
function normalizeAndroidDate(date: Date, utcOffset: number): Date {
  const calendarDate = new Date(date.getTime() + utcOffset * 60_000);
  return new Date(calendarDate.getUTCFullYear(), calendarDate.getUTCMonth(), calendarDate.getUTCDate(), 12);
}

export function DateTimeField({ mode, value, label, display, onChange, onClear }: Props) {
  const [iosOpen, setIosOpen] = useState(false);
  const [draft, setDraft] = useState(value);
  const icon = mode === 'date' ? 'calendar-outline' : 'time-outline';

  const openPicker = () => {
    if (Platform.OS === 'android') {
      DateTimePickerAndroid.open({
        value,
        mode,
        is24Hour: true,
        onChange: (event: DateTimePickerEvent, d?: Date) => {
          if (event.type !== 'set' || !d) return;
          onChange(mode === 'date' ? normalizeAndroidDate(d, event.nativeEvent.utcOffset) : d);
        },
      });
    } else {
      setDraft(value);
      setIosOpen(true);
    }
  };

  const confirmIOS = () => {
    setIosOpen(false);
    onChange(mode === 'date' ? localNoon(draft) : draft);
  };

  const clearButton = onClear ? (
    <Pressable onPress={onClear} hitSlop={10} accessibilityLabel={`Limpar ${label.toLowerCase()}`}>
      <Ionicons name="close-circle" size={18} color={colors.textMuted} />
    </Pressable>
  ) : null;

  // ---------- Web: seletor do navegador ----------
  if (Platform.OS === 'web') {
    const webValue =
      mode === 'date'
        ? `${value.getFullYear()}-${pad(value.getMonth() + 1)}-${pad(value.getDate())}`
        : display.includes(':')
          ? `${pad(value.getHours())}:${pad(value.getMinutes())}`
          : '';
    return (
      <View style={{ flex: 1 }}>
        <Text style={styles.label}>{label}</Text>
        <View style={styles.field}>
          <Ionicons name={icon} size={18} color={colors.primary} />
          <input
            type={mode}
            value={webValue}
            aria-label={label}
            onChange={(e) => {
              const text = e.currentTarget.value;
              if (!text) return;
              if (mode === 'date') {
                const [y, m, d] = text.split('-').map(Number);
                onChange(new Date(y, m - 1, d, 12));
              } else {
                const [h, min] = text.split(':').map(Number);
                const next = new Date(value);
                next.setHours(h, min, 0, 0);
                onChange(next);
              }
            }}
            style={webInputStyle}
          />
          {clearButton}
        </View>
      </View>
    );
  }

  // ---------- Android e iPhone ----------
  return (
    <View style={{ flex: 1 }}>
      <Text style={styles.label}>{label}</Text>
      <Pressable
        style={({ pressed }) => [styles.field, pressed && { opacity: 0.7 }]}
        onPress={openPicker}
        hitSlop={4}
        accessibilityRole="button"
        accessibilityLabel={`${label}: ${display}. Toque para alterar.`}
      >
        <Ionicons name={icon} size={18} color={colors.primary} />
        <Text style={styles.value}>{display}</Text>
        {clearButton ?? <Ionicons name="chevron-down" size={16} color={colors.textMuted} />}
      </Pressable>

      {Platform.OS === 'ios' && (
        <Modal visible={iosOpen} transparent animationType="slide" onRequestClose={() => setIosOpen(false)}>
          <Pressable style={styles.backdrop} onPress={() => setIosOpen(false)} />
          <View style={styles.sheet}>
            <View style={styles.sheetHeader}>
              <Pressable onPress={() => setIosOpen(false)} hitSlop={10}>
                <Text style={styles.cancel}>Cancelar</Text>
              </Pressable>
              <Text style={styles.sheetTitle}>{mode === 'date' ? 'Escolha a data' : 'Escolha o horário'}</Text>
              <Pressable onPress={confirmIOS} hitSlop={10}>
                <Text style={styles.ok}>OK</Text>
              </Pressable>
            </View>
            <DateTimePicker
              value={draft}
              mode={mode}
              display={mode === 'date' ? 'inline' : 'spinner'}
              is24Hour
              locale="pt-BR"
              themeVariant="light"
              textColor={colors.text}
              accentColor={colors.primary}
              onChange={(_event, d) => d && setDraft(d)}
              style={styles.iosPicker}
            />
          </View>
        </Modal>
      )}
    </View>
  );
}

const webInputStyle = {
  flex: 1,
  border: 'none',
  outline: 'none',
  background: 'transparent',
  fontSize: 15,
  color: colors.text,
  fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
  minWidth: 0,
  cursor: 'pointer',
} as const;

const styles = StyleSheet.create({
  label: { fontSize: 14, fontWeight: '600', color: colors.text, marginBottom: spacing.sm },
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.md,
    minHeight: 48,
  },
  value: { flex: 1, fontSize: 15, color: colors.text },
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.35)' },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    paddingBottom: spacing.xl * 1.5,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  sheetTitle: { fontSize: 15, fontWeight: '700', color: colors.text },
  cancel: { fontSize: 16, color: colors.textMuted },
  ok: { fontSize: 16, fontWeight: '700', color: colors.primary },
  iosPicker: { alignSelf: 'center' },
});
