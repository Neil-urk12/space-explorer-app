import { Hairline } from '@/components/ui/Chrome';
import { Mark } from '@/components/ui/Marks';
import { Type } from '@/components/ui/Type';
import { useTheme } from '@/context/ThemeContext';
import { CATALOG_DATES } from '@/data/catalog';
import { fonts, layout, radius } from '@/theme';
import { previewUrl, SpaceItem } from '@/types/space';
import { daysInMonth, formatHudDate, formatMonthYear, parseIsoDate, toIsoDate } from '@/utils/dates';
import { Image } from 'expo-image';
import { memo, useCallback, useLayoutEffect, useMemo, useState } from 'react';
import { Modal, Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type DateFilterSheetProps = {
  visible: boolean;
  onClose: () => void;
  selectedDate: string | null;
  onSelectDate: (date: string | null) => void;
  availableDates?: Set<string>;
  items?: SpaceItem[];
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

export const DateFilterSheet = memo(function DateFilterSheet({
  visible,
  onClose,
  selectedDate,
  onSelectDate,
  availableDates,
  items = [],
}: DateFilterSheetProps) {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();

  const now = new Date();
  const currentMonthIso = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;

  // Start viewing on the month of the selected date (if any), or the current month
  const initialMonth = selectedDate ? `${selectedDate.slice(0, 7)}-01` : currentMonthIso;
  const [monthIso, setMonthIso] = useState(initialMonth);
  const [tempDate, setTempDate] = useState<string | null>(selectedDate);

  const syncCommittedState = useCallback(() => {
    setTempDate(selectedDate);
    setMonthIso(selectedDate ? `${selectedDate.slice(0, 7)}-01` : currentMonthIso);
  }, [currentMonthIso, selectedDate]);

  useLayoutEffect(() => {
    // oxlint-disable-next-line react/set-state-in-effect -- restore the committed draft before the modal paints
    if (visible) syncCommittedState();
  }, [syncCommittedState, visible]);

  const handleClose = useCallback(() => {
    syncCommittedState();
    onClose();
  }, [onClose, syncCommittedState]);

  const activeDates = availableDates || CATALOG_DATES;

  const cursor = parseIsoDate(monthIso);
  const year = cursor.getFullYear();
  const month = cursor.getMonth();
  const days = daysInMonth(year, month);
  const blanks = new Date(year, month, 1).getDay();
  const cells = useMemo(
    () => [...Array(blanks).fill(null), ...Array.from({ length: days }, (_, i) => i + 1)],
    [blanks, days],
  );

  const shownMonth = `${year}-${String(month + 1).padStart(2, '0')}-01`;

  // Find preview item for the currently highlighted date
  const previewItem = useMemo(() => {
    if (!tempDate) return null;
    return items.find((item) => item.date === tempDate) || null;
  }, [items, tempDate]);

  // Latest available date in archive
  const latestDate = useMemo(() => {
    const list = Array.from(activeDates).sort();
    return list.length > 0 ? list[list.length - 1] : null;
  }, [activeDates]);

  const handleApply = useCallback(() => {
    onSelectDate(tempDate);
    onClose();
  }, [onSelectDate, tempDate, onClose]);

  const handleClear = useCallback(() => {
    setTempDate(null);
    onSelectDate(null);
    onClose();
  }, [onSelectDate, onClose]);

  const handleSelectPresetLatest = useCallback(() => {
    if (latestDate) {
      setTempDate(latestDate);
      setMonthIso(`${latestDate.slice(0, 7)}-01`);
    }
  }, [latestDate]);

  const handleSelectPresetRandom = useCallback(() => {
    const list = Array.from(activeDates);
    if (list.length > 0) {
      const random = list[Math.floor(Math.random() * list.length)];
      setTempDate(random);
      setMonthIso(`${random.slice(0, 7)}-01`);
    }
  }, [activeDates]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
    >
      <View style={styles.modalOverlay}>
        <Pressable
          style={styles.scrim}
          onPress={handleClose}
          accessibilityRole="button"
          accessibilityLabel="Close date filter"
        />

        <ScrollView
          style={[
            styles.sheetContainer,
            {
              backgroundColor: colors.panelSolid,
              borderColor: colors.hairlineStrong,
            },
          ]}
          contentContainerStyle={[
            styles.sheetContent,
            { paddingBottom: Math.max(insets.bottom, 16) + 8 },
          ]}
          showsVerticalScrollIndicator={false}
        >
          {/* Top Grab Handle */}
          <View style={[styles.dragHandle, { backgroundColor: colors.hairlineStrong }]} />

          {/* Header */}
          <View style={styles.header}>
            <View style={{ flex: 1 }}>
              <Type variant="micro" color={colors.gold}>
                OBSERVATORY ARCHIVE
              </Type>
              <Type variant="headline" style={{ marginTop: 2 }}>
                Lock Observation Date
              </Type>
            </View>
            <Pressable
              onPress={handleClose}
              hitSlop={12}
              accessibilityRole="button"
              accessibilityLabel="Close date selector"
              style={[styles.closeButton, { borderColor: colors.hairline, backgroundColor: colors.panel }]}
            >
              <Mark name="close" size={14} active={false} />
            </Pressable>
          </View>

          {/* Quick Shortcuts */}
          <View style={styles.presetsRow}>
            {latestDate ? (
              <Pressable
                onPress={handleSelectPresetLatest}
                accessibilityRole="button"
                accessibilityLabel="Select latest observation"
                style={[
                  styles.presetChip,
                  { borderColor: colors.hairline, backgroundColor: colors.panel },
                  tempDate === latestDate && { borderColor: colors.spark, backgroundColor: colors.sparkDim },
                ]}
              >
                <Type
                  variant="micro"
                  color={tempDate === latestDate ? colors.spark : colors.star}
                >
                  Latest Plate
                </Type>
              </Pressable>
            ) : null}

            <Pressable
              onPress={handleSelectPresetRandom}
              accessibilityRole="button"
              accessibilityLabel="Select random observation"
              style={[styles.presetChip, { borderColor: colors.hairline, backgroundColor: colors.panel }]}
            >
              <Type variant="micro" color={colors.star}>
                Random Night
              </Type>
            </Pressable>

            {tempDate ? (
              <Pressable
                onPress={() => setTempDate(null)}
                accessibilityRole="button"
                accessibilityLabel="Clear selected date"
                style={[styles.presetChip, { borderColor: colors.hairline, backgroundColor: colors.panel }]}
              >
                <Type variant="micro" color={colors.danger}>
                  Clear Selection
                </Type>
              </Pressable>
            ) : null}
          </View>

          <Hairline style={{ marginVertical: 14 }} />

          {/* Month Navigation */}
          <View style={styles.monthNav}>
            <Pressable
              onPress={() => setMonthIso((current) => nudgeMonth(current, -1))}
              hitSlop={12}
              accessibilityRole="button"
              accessibilityLabel="Previous month"
              style={({ pressed }) => [
                styles.navArrow,
                { borderColor: colors.hairline, backgroundColor: colors.panel },
                pressed && styles.pressed,
              ]}
            >
              <Type variant="label" color={colors.spark}>
                ←
              </Type>
            </Pressable>

            <Type variant="label" color={colors.star} style={{ fontFamily: fonts.semibold }}>
              {formatMonthYear(shownMonth)}
            </Type>

            <Pressable
              onPress={() => setMonthIso((current) => nudgeMonth(current, 1))}
              hitSlop={12}
              accessibilityRole="button"
              accessibilityLabel="Next month"
              style={({ pressed }) => [
                styles.navArrow,
                { borderColor: colors.hairline, backgroundColor: colors.panel },
                pressed && styles.pressed,
              ]}
            >
              <Type variant="label" color={colors.spark}>
                →
              </Type>
            </Pressable>
          </View>

          {/* Weekday Header */}
          <View style={styles.weekRow}>
            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => (
              <Type key={`${day}-${index}`} variant="micro" style={styles.weekCell}>
                {day}
              </Type>
            ))}
          </View>

          {/* Calendar Grid */}
          <View style={styles.grid}>
            {cells.map((day, index) => {
              if (!day) return <View key={`b-${index}`} style={styles.day} />;
              const iso = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
              const hasPlate = activeDates.has(iso);
              const isSelected = tempDate === iso;

              return (
                <Pressable
                  key={iso}
                  disabled={!hasPlate}
                  onPress={() => setTempDate(isSelected ? null : iso)}
                  accessibilityRole="button"
                  accessibilityLabel={`${formatHudDate(iso)}${hasPlate ? ', plate available' : ', no plate'}`}
                  accessibilityState={{ selected: isSelected, disabled: !hasPlate }}
                  style={({ pressed }) => [
                    styles.day,
                    isSelected && { backgroundColor: colors.spark, borderColor: colors.spark },
                    hasPlate && !isSelected && { backgroundColor: colors.sparkDim, borderColor: colors.hairline },
                    !hasPlate && styles.dayOff,
                    pressed && hasPlate && styles.pressed,
                  ]}
                >
                  <Type
                    variant="numeric"
                    color={isSelected ? colors.onAccent : hasPlate ? colors.star : colors.faint}
                    style={{ fontSize: 13 }}
                  >
                    {String(day).padStart(2, '0')}
                  </Type>
                  {hasPlate && !isSelected ? (
                    <View style={[styles.plateDot, { backgroundColor: colors.spark }]} />
                  ) : null}
                </Pressable>
              );
            })}
          </View>

          {/* Selected Plate Preview or Hint */}
          <View style={[styles.previewBox, { borderColor: colors.hairline, backgroundColor: colors.panel }]}>
            {previewItem ? (
              <View style={styles.previewContent}>
                <Image
                  source={{ uri: previewUrl(previewItem) }}
                  style={styles.previewThumb}
                  contentFit="cover"
                  transition={200}
                />
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Type variant="micro" color={colors.gold}>
                    {formatHudDate(previewItem.date)} · {previewItem.category.toUpperCase()}
                  </Type>
                  <Type variant="label" numberOfLines={1} style={{ marginTop: 2 }}>
                    {previewItem.title}
                  </Type>
                </View>
              </View>
            ) : tempDate ? (
              <View style={styles.previewHint}>
                <Type variant="micro" color={colors.spark}>
                  Locked Date: {formatHudDate(tempDate)}
                </Type>
              </View>
            ) : (
              <View style={styles.previewHint}>
                <Type variant="micro" color={colors.faint}>
                  Lit dates have recorded observation plates in this archive.
                </Type>
              </View>
            )}
          </View>

          {/* Action Buttons */}
          <View style={styles.actionsRow}>
            {selectedDate || tempDate ? (
              <Pressable
                onPress={handleClear}
                accessibilityRole="button"
                accessibilityLabel="Clear date filter"
                style={({ pressed }) => [
                  styles.clearAction,
                  { borderColor: colors.hairline, backgroundColor: colors.panel },
                  pressed && styles.pressed,
                ]}
              >
                <Type variant="label" color={colors.danger}>
                  Clear Lock
                </Type>
              </Pressable>
            ) : null}

            <Pressable
              onPress={handleApply}
              accessibilityRole="button"
              accessibilityLabel="Apply observation date filter"
              style={({ pressed }) => [
                styles.applyAction,
                { backgroundColor: colors.spark },
                pressed && styles.pressed,
              ]}
            >
              <Type variant="label" color={colors.onAccent} style={{ fontFamily: fonts.semibold }}>
                {tempDate ? `Lock ${formatHudDate(tempDate)}` : 'Show All Dates'}
              </Type>
            </Pressable>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
});

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.74)',
  },
  scrim: {
    ...StyleSheet.absoluteFill,
  },
  sheetContainer: {
    width: '100%',
    maxWidth: Platform.OS === 'web' ? layout.phone : undefined,
    maxHeight: '100%',
    flexGrow: 0,
    alignSelf: 'center',
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  sheetContent: {
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  dragHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 14,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: radius.full,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
    justifyContent: 'center',
  },
  presetsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  presetChip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: radius.full,
    borderWidth: StyleSheet.hairlineWidth,
  },
  monthNav: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  navArrow: {
    width: 44,
    height: 44,
    borderRadius: radius.sm,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
    justifyContent: 'center',
  },
  weekRow: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  weekCell: {
    width: `${100 / 7}%`,
    textAlign: 'center',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    rowGap: 4,
  },
  day: {
    width: `${100 / 7}%`,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.sm,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'transparent',
  },
  dayOff: {
    opacity: 0.28,
  },
  plateDot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    marginTop: 2,
  },
  previewBox: {
    marginTop: 14,
    minHeight: 52,
    borderRadius: radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 8,
    justifyContent: 'center',
  },
  previewContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  previewThumb: {
    width: 40,
    height: 40,
    borderRadius: radius.sm,
  },
  previewHint: {
    alignItems: 'center',
    paddingVertical: 6,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 14,
  },
  clearAction: {
    flex: 1,
    height: 48,
    borderRadius: radius.full,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
    justifyContent: 'center',
  },
  applyAction: {
    flex: 2,
    height: 48,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.78,
  },
});
