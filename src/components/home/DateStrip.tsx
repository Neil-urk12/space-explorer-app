import { Type } from '@/components/ui/Type';
import { useTheme } from '@/context/ThemeContext';
import { CATALOG } from '@/data/catalog';
import { radius } from '@/theme';
import { formatShortDate } from '@/utils/dates';
import { detailsHref } from '@/utils/navigation';
import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

export function DateStrip({ activeId }: { activeId?: string }) {
  const { colors } = useTheme();

  return (
    <View>
      <View style={styles.head}>
        <Type variant="micro">Browse by date</Type>
        <View style={[styles.rule, { backgroundColor: colors.hairline }]} />
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
        {CATALOG.map((item) => {
          const active = item.id === activeId;
          return (
            <Pressable
              key={item.id}
              onPress={() => router.push(detailsHref(item.id))}
              style={[
                styles.chip,
                { borderColor: colors.hairline, backgroundColor: colors.panel },
                active && { backgroundColor: colors.spark, borderColor: colors.spark },
              ]}
            >
              <Type variant="numeric" color={active ? colors.onAccent : colors.star}>
                {formatShortDate(item.date)}
              </Type>
              <Type variant="micro" color={active ? colors.onAccent : colors.faint} style={{ marginTop: 4 }} numberOfLines={1}>
                {item.category}
              </Type>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  head: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  rule: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
  },
  row: {
    gap: 8,
    paddingRight: 8,
  },
  chip: {
    minWidth: 86,
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: radius.md,
    borderWidth: StyleSheet.hairlineWidth,
  },
});
