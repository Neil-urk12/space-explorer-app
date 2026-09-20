import { DateFilterSheet } from '@/components/search/DateFilterSheet';
import { Hairline, Pill } from '@/components/ui/Chrome';
import { Mark } from '@/components/ui/Marks';
import { Type } from '@/components/ui/Type';
import { useTheme } from '@/context/ThemeContext';
import { fonts, radius } from '@/theme';
import { CategoryFilter, MediaFilter, SpaceItem } from '@/types/space';
import { formatHudDate } from '@/utils/dates';
import { memo, useState } from 'react';
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
  items?: SpaceItem[];
};

export const SearchPanel = memo(function SearchPanel({
  query,
  onQuery,
  media,
  onMedia,
  category,
  onCategory,
  selectedDate,
  onSelectDate,
  availableDates,
  items,
}: Props) {
  const { colors } = useTheme();
  const [sheetVisible, setSheetVisible] = useState(false);

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

      <Hairline style={{ marginVertical: 16 }} />

      {/* Observation Date Filter Trigger */}
      <View
        style={[
          styles.dateTrigger,
          {
            borderColor: selectedDate ? colors.spark : colors.hairline,
            backgroundColor: selectedDate ? colors.sparkDim : colors.panel,
          },
        ]}
      >
        <Pressable
          onPress={() => setSheetVisible(true)}
          accessibilityRole="button"
          accessibilityLabel={
            selectedDate
              ? `Observation date locked to ${formatHudDate(selectedDate)}. Tap to change date.`
              : 'Lock observation date. Tap to open calendar archive.'
          }
          style={({ pressed }) => [
            styles.dateTriggerButton,
            !selectedDate && styles.dateTriggerButtonWithArrow,
            pressed && styles.pressed,
          ]}
        >
          <View style={styles.dateTriggerLeft}>
            <View
              style={[
                styles.dateIconWrap,
                {
                  backgroundColor: selectedDate ? colors.spark : colors.panelHot,
                  borderColor: selectedDate ? colors.spark : colors.hairline,
                },
              ]}
            >
              <Mark name="calendar" active={Boolean(selectedDate)} size={16} />
            </View>
            <View style={styles.dateTriggerTexts}>
              <Type variant="micro" color={selectedDate ? colors.spark : colors.gold}>
                {selectedDate ? 'LOCKED OBSERVATION DATE' : 'OBSERVATION DATE'}
              </Type>
              <Type
                variant="label"
                color={selectedDate ? colors.spark : colors.star}
                style={{ fontFamily: selectedDate ? fonts.semibold : fonts.regular, marginTop: 2 }}
              >
                {selectedDate ? formatHudDate(selectedDate) : 'Any date in archive (Tap to lock)'}
              </Type>
            </View>
          </View>

          {!selectedDate ? (
            <View style={[styles.filterArrow, { borderColor: colors.hairline }]}>
              <Type variant="micro" color={colors.faint}>
                Filter ▾
              </Type>
            </View>
          ) : null}
        </Pressable>

        {selectedDate ? (
          <Pressable
            onPress={() => onSelectDate(null)}
            hitSlop={12}
            accessibilityRole="button"
            accessibilityLabel="Clear date lock"
            style={[styles.clearPill, { borderColor: colors.hairlineStrong, backgroundColor: colors.panel }]}
          >
            <Mark name="close" size={10} active />
            <Type variant="micro" color={colors.spark} style={{ marginLeft: 6 }}>
              Clear
            </Type>
          </Pressable>
        ) : null}
      </View>

      <DateFilterSheet
        visible={sheetVisible}
        onClose={() => setSheetVisible(false)}
        selectedDate={selectedDate}
        onSelectDate={onSelectDate}
        availableDates={availableDates}
        items={items}
      />
    </View>
  );
});

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
  dateTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    minHeight: 56,
  },
  dateTriggerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    paddingLeft: 14,
    paddingVertical: 12,
  },
  dateTriggerButtonWithArrow: {
    paddingRight: 14,
  },
  dateTriggerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  dateIconWrap: {
    width: 36,
    height: 36,
    borderRadius: radius.sm,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dateTriggerTexts: {
    marginLeft: 12,
    flex: 1,
  },
  clearPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: radius.full,
    borderWidth: StyleSheet.hairlineWidth,
    marginRight: 14,
  },
  filterArrow: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radius.sm,
    borderWidth: StyleSheet.hairlineWidth,
  },
  pressed: {
    opacity: 0.78,
  },
});
