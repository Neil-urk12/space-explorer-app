import { CategoryRail } from '@/components/navigation/CategoryRail';
import { Hairline } from '@/components/ui/Chrome';
import { Type } from '@/components/ui/Type';
import { useTheme } from '@/context/ThemeContext';
import { fonts } from '@/theme';
import { CategoryFilter } from '@/types/space';
import { daysInMonth, formatHudDate, formatMonthYear, parseIsoDate, toIsoDate } from '@/utils/dates';
import { memo, useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';

const CATS: { id: CategoryFilter; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'galaxy', label: 'Galaxy' },
  { id: 'nebula', label: 'Nebula' },
  { id: 'planet', label: 'Planet' },
  { id: 'earth', label: 'Earth' },
  { id: 'moon', label: 'Moon' },
];

type Props = {
  query: string;
  onQuery: (value: string) => void;
  category: CategoryFilter;
  onCategory: (value: CategoryFilter) => void;
  selectedDate: string | null;
  onSelectDate: (value: string | null) => void;
  availableDates?: Set<string>;
  filters?: boolean;
  calendar?: boolean;
};

function nudgeMonth(iso: string, amount: number): string {
  const date = parseIsoDate(iso);
  date.setDate(1);
  date.setMonth(date.getMonth() + amount);
  const next = toIsoDate(date);
  const now = new Date();
  const maxMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
  if (next < '2024-01-01' || next > maxMonth) return iso;
  return next;
}

export const SearchPanel = memo(function SearchPanel({
  query,
  onQuery,
  category,
  onCategory,
  selectedDate,
  onSelectDate,
  availableDates,
  filters = true,
  calendar = true,
}: Props) {
  const { colors } = useTheme();
  const now = new Date();
  const currentMonthIso = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
  const [monthIso, setMonthIso] = useState(currentMonthIso);
  const [open, setOpen] = useState(false);
  const cursor = parseIsoDate(monthIso);
  const year = cursor.getFullYear();
  const month = cursor.getMonth();
  const days = daysInMonth(year, month);
  const blanks = new Date(year, month, 1).getDay();
  const cells = useMemo(() => [...Array(blanks).fill(null), ...Array.from({ length: days }, (_, i) => i + 1)], [blanks, days]);
  const activeDates = availableDates ?? new Set<string>();
  const todayIso = toIsoDate(new Date());
  const shownMonth = `${year}-${String(month + 1).padStart(2, '0')}-01`;

  useEffect(() => {
    if (!selectedDate) return;
    setMonthIso(`${selectedDate.slice(0, 7)}-01`);
  }, [selectedDate]);

  const pickDay = (iso: string, selected: boolean) => {
    onSelectDate(selected ? null : iso);
    if (!selected) setOpen(false);
  };

  return (
    <View>
      {filters ? (
        <>
          <TextInput
            value={query}
            onChangeText={onQuery}
            placeholder="Search the archive"
            placeholderTextColor={colors.faint}
            style={[styles.input, { color: colors.star, backgroundColor: 'rgba(255,255,255,0.08)' }]}
          />

          <View style={styles.rails}>
            <CategoryRail items={CATS} value={category} onChange={onCategory} pinFirst />
          </View>
        </>
      ) : null}

      {calendar ? (
        <>
          <Hairline style={{ marginTop: filters ? 8 : 0, marginBottom: 16 }} />

          <Pressable
            accessibilityRole="button"
            accessibilityLabel={selectedDate ? `Locked to ${formatHudDate(selectedDate)}` : 'Jump to a night'}
            accessibilityState={{ expanded: open }}
            onPress={() => setOpen((value) => !value)}
            style={[
              styles.trigger,
              {
                borderColor: selectedDate || open ? colors.hairlineStrong : colors.hairline,
                backgroundColor: colors.panel,
              },
            ]}
          >
            <View style={styles.triggerCopy}>
              <Type variant="micro" color={colors.gold}>
                {selectedDate ? 'Locked night' : 'Date lock'}
              </Type>
              <Type variant="title" style={styles.triggerTitle}>
                {selectedDate ? formatHudDate(selectedDate) : 'Jump to a night'}
              </Type>
            </View>
            <Type variant="label" color={colors.spark}>
              {open ? 'Hide' : selectedDate ? 'Change' : 'Open'}
            </Type>
          </Pressable>

          {selectedDate && !open ? (
            <Pressable onPress={() => onSelectDate(null)} style={[styles.clear, { borderBottomColor: colors.spark }]}>
              <Type variant="micro" color={colors.spark}>
                Clear date lock
              </Type>
            </Pressable>
          ) : null}

          {open ? (
            <View style={styles.sheet}>
              <View style={styles.monthNav}>
                <Pressable
                  onPress={() => {
                    onSelectDate(null);
                    setMonthIso((current) => nudgeMonth(current, -1));
                  }}
                  hitSlop={8}
                >
                  <Type variant="label" color={colors.spark}>
                    ←
                  </Type>
                </Pressable>
                <Type variant="label" color={colors.star}>
                  {formatMonthYear(shownMonth)}
                </Type>
                <Pressable
                  onPress={() => {
                    onSelectDate(null);
                    setMonthIso((current) => nudgeMonth(current, 1));
                  }}
                  hitSlop={8}
                >
                  <Type variant="label" color={colors.spark}>
                    →
                  </Type>
                </Pressable>
              </View>

              <View style={styles.weekRow}>
                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => (
                  <Type key={`${day}-${index}`} variant="micro" style={styles.weekCell}>
                    {day}
                  </Type>
                ))}
              </View>
              <View style={styles.grid}>
                {cells.map((day, index) => {
                  if (!day) return <View key={`b-${index}`} style={styles.day} />;
                  const iso = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                  const hasPlate = activeDates.has(iso);
                  const selected = selectedDate === iso;
                  const dayOpen = iso <= todayIso;
                  return (
                    <Pressable
                      key={iso}
                      disabled={!dayOpen}
                      onPress={() => pickDay(iso, selected)}
                      style={[styles.day, !dayOpen && styles.dayOff]}
                    >
                      <View
                        style={[
                          styles.mark,
                          hasPlate && !selected && styles.marked,
                          selected && { backgroundColor: colors.spark, borderColor: colors.spark },
                        ]}
                      >
                        <Type variant="numeric" color={selected ? colors.onAccent : dayOpen ? colors.star : colors.faint}>
                          {String(day).padStart(2, '0')}
                        </Type>
                      </View>
                    </Pressable>
                  );
                })}
              </View>
              {selectedDate ? (
                <Pressable onPress={() => onSelectDate(null)} style={[styles.clear, { borderBottomColor: colors.spark }]}>
                  <Type variant="micro" color={colors.spark}>
                    Clear date lock
                  </Type>
                </Pressable>
              ) : null}
            </View>
          ) : null}

          <Hairline style={{ marginTop: 16 }} />
        </>
      ) : null}
    </View>
  );
});

const styles = StyleSheet.create({
  input: {
    fontSize: 16,
    fontFamily: fonts.regular,
    borderRadius: 999,
    paddingHorizontal: 18,
    paddingVertical: 14,
  },
  rails: {
    marginTop: 16,
  },
  trigger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
    borderRadius: 18,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  triggerCopy: {
    flex: 1,
    gap: 4,
  },
  triggerTitle: {
    fontSize: 18,
    lineHeight: 22,
  },
  sheet: {
    marginTop: 16,
  },
  monthNav: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  weekRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  weekCell: {
    width: `${100 / 7}%`,
    textAlign: 'center',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  day: {
    width: `${100 / 7}%`,
    height: 38,
    padding: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mark: {
    flex: 1,
    alignSelf: 'stretch',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  marked: {
    borderColor: '#FFFFFF',
  },
  dayOff: {
    opacity: 0.35,
  },
  clear: {
    alignSelf: 'flex-start',
    marginTop: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    paddingBottom: 3,
  },
});
