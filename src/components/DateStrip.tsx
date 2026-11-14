import React, { useEffect, useMemo, useRef } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { addDays, dayNumber, todayKey, weekdayShort } from '../utils/date';
import { colors, radius, spacing } from '../theme';

interface Props {
  selected: string;
  onSelect: (date: string) => void;
  datesWithTasks: Set<string>;
}

const PAST_DAYS = 7;
const FUTURE_DAYS = 21;
const ITEM_WIDTH = 56;

/** Faixa horizontal de dias para escolher a data exibida. */
export function DateStrip({ selected, onSelect, datesWithTasks }: Props) {
  const today = todayKey();
  const days = useMemo(
    () => Array.from({ length: PAST_DAYS + FUTURE_DAYS + 1 }, (_, i) => addDays(today, i - PAST_DAYS)),
    [today]
  );
  const listRef = useRef<FlatList<string>>(null);

  useEffect(() => {
    const index = days.indexOf(selected);
    if (index >= 0) listRef.current?.scrollToIndex({ index: Math.max(index - 2, 0), animated: true });
  }, [selected, days]);

  return (
    <FlatList
      ref={listRef}
      data={days}
      horizontal
      keyExtractor={(d) => d}
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ paddingHorizontal: spacing.lg, gap: spacing.sm }}
      getItemLayout={(_, index) => ({ length: ITEM_WIDTH + spacing.sm, offset: (ITEM_WIDTH + spacing.sm) * index, index })}
      initialScrollIndex={PAST_DAYS - 2}
      renderItem={({ item }) => {
        const isSel = item === selected;
        const isToday = item === today;
        return (
          <Pressable onPress={() => onSelect(item)} style={[styles.day, isSel && styles.daySel]}>
            <Text style={[styles.week, isSel && styles.textSel]}>{isToday ? 'Hoje' : weekdayShort(item)}</Text>
            <Text style={[styles.num, isSel && styles.textSel]}>{dayNumber(item)}</Text>
            <View style={[styles.dot, { opacity: datesWithTasks.has(item) ? 1 : 0 }, isSel && { backgroundColor: '#fff' }]} />
          </Pressable>
        );
      }}
    />
  );
}

const styles = StyleSheet.create({
  day: {
    width: ITEM_WIDTH,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  daySel: { backgroundColor: colors.primary, borderColor: colors.primary },
  week: { fontSize: 12, color: colors.textMuted },
  num: { fontSize: 18, fontWeight: '700', color: colors.text, marginTop: 2 },
  textSel: { color: '#fff' },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.primary, marginTop: 4 },
});
