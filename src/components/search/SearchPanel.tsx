import { Hairline, Pill } from '@/components/ui/Chrome';
import { Type } from '@/components/ui/Type';
import { useTheme } from '@/context/ThemeContext';
import { CATALOG_DATES } from '@/data/catalog';
import { fonts, radius } from '@/theme';
import { CategoryFilter, MediaFilter } from '@/types/space';
import { daysInMonth, formatMonthYear, parseIsoDate, toIsoDate } from '@/utils/dates';
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';

const MEDIA: { id: MediaFilter; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'image', label: 'Images' },
  { id: 'video', label: 'Video' },
];

const CATS: { id: CategoryFilter; label: string }[] = [
  { id: 'all', label: 'Any sky' },
  { id: 'galaxy', label: 'Galaxy' },
  { id: 'nebula', label: 'Nebula' },
  { id: 'planet', label: 'Planet' },
  { id: 'earth', label: 'Earth' },
  { id: 'moon', label: 'Moon' },
];

type Props = {
  query: string;
  onQuery: (value: string) => void;
  media: MediaFilter;
  onMedia: (value: MediaFilter) => void;
  category: CategoryFilter;
  onCategory: (value: CategoryFilter) => void;
  selectedDate: string | null;
  onSelectDate: (value: string | null) => void;
  availableDates?: Set<string>;
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

export function SearchPanel({
  query,
  onQuery,
  media,
  onMedia,
  category,
  onCategory,
  selectedDate,
  onSelectDate,
  availableDates,
}: Props) {
  const { colors } = useTheme();
  const now = new Date();
  const currentMonthIso = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
  const [monthIso, setMonthIso] = useState(currentMonthIso);
  const cursor = parseIsoDate(monthIso);
  const year = cursor.getFullYear();
  const month = cursor.getMonth();
  const days = daysInMonth(year, month);
  const blanks = new Date(year, month, 1).getDay();
  const cells = useMemo(() => [...Array(blanks).fill(null), ...Array.from({ length: days }, (_, i) => i + 1)], [blanks, days]);
  const activeDates = availableDates || CATALOG_DATES;
  const shownMonth = `${year}-${String(month + 1).padStart(2, '0')}-01`;

  return (
    <View>
      <View style={{ paddingRight: 36 }}>
        <Type variant="micro" color={colors.gold}>
          Search / Filter
        </Type>
        <Type variant="headline" style={{ marginTop: 10 }}>
          Find a night in the archive.
        </Type>
      </View>
      <Type variant="body" style={{ marginTop: 10, marginBottom: 18 }}>
        Filter by title, media, sky type, or lock a calendar date from this archive.
      </Type>

      <View style={[styles.inputWrap, { borderColor: colors.hairline, backgroundColor: colors.panel }]}>
        <Type variant="micro">Query</Type>
        <TextInput
          value={query}
          onChangeText={onQuery}
          placeholder="Title, nebula, planet…"
          placeholderTextColor={colors.faint}
          style={[styles.input, { color: colors.star }]}
        />
      </View>

      <View style={styles.filters}>
        {MEDIA.map((item) => (
          <Pill key={item.id} label={item.label} active={media === item.id} onPress={() => onMedia(item.id)} />
        ))}
      </View>
      <View style={[styles.filters, { marginTop: 8 }]}>
        {CATS.map((item) => (
          <Pill key={item.id} label={item.label} active={category === item.id} onPress={() => onCategory(item.id)} />
        ))}
      </View>

      <Hairline style={{ marginVertical: 18 }} />

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
          return (
            <Pressable
              key={iso}
              disabled={!hasPlate}
              onPress={() => onSelectDate(selected ? null : iso)}
              style={[
                styles.day,
                selected && { backgroundColor: colors.spark },
                hasPlate && !selected && { backgroundColor: colors.sparkDim },
                !hasPlate && styles.dayOff,
              ]}
            >
              <Type variant="numeric" color={selected ? colors.onAccent : hasPlate ? colors.star : colors.faint}>
                {String(day).padStart(2, '0')}
              </Type>
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
      ) : (
        <Type variant="micro" style={{ marginTop: 12 }}>
          Lit dates have a plate in this archive
        </Type>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  inputWrap: {
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 14,
    paddingTop: 10,
    paddingBottom: 8,
    borderRadius: radius.md,
  },
  input: {
    marginTop: 8,
    fontSize: 16,
    paddingVertical: 6,
    fontFamily: fonts.regular,
  },
  filters: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
  },
  monthNav: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  weekRow: {
    flexDirection: 'row',
    marginBottom: 4,
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
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
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
