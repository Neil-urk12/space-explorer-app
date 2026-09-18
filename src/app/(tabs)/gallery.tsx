import { SpaceCard } from '@/components/media/SpaceCard';
import { Pill } from '@/components/ui/Chrome';
import { Screen } from '@/components/ui/Screen';
import { Type } from '@/components/ui/Type';
import { useApod } from '@/context/ApodContext';
import { useTheme } from '@/context/ThemeContext';
import { CATALOG } from '@/data/catalog';
import { CategoryFilter, SpaceItem } from '@/types/space';
import { memo, useCallback, useMemo, useState } from 'react';
import { FlatList, ListRenderItemInfo, StyleSheet, View } from 'react-native';

const FILTERS: { id: CategoryFilter; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'galaxy', label: 'Galaxies' },
  { id: 'nebula', label: 'Nebulae' },
  { id: 'planet', label: 'Planets' },
  { id: 'earth', label: 'Earth' },
  { id: 'moon', label: 'Moon' },
];

function ItemSeparator() {
  return <View style={styles.separator} />;
}

function rowKeyExtractor(row: SpaceItem[]): string {
  return row.length === 2 ? `${row[0].id}:${row[1].id}` : (row[0]?.id ?? '');
}

const GalleryHeader = memo(function GalleryHeader({
  filter,
  onSelectFilter,
}: {
  filter: CategoryFilter;
  onSelectFilter: (filter: CategoryFilter) => void;
}) {
  const { colors } = useTheme();

  return (
    <View>
      <View style={{ paddingRight: 36 }}>
        <Type variant="micro" color={colors.gold}>
          Gallery
        </Type>
        <Type variant="headline" style={{ marginTop: 10 }}>
          A constellation of plates.
        </Type>
      </View>
      <Type variant="body" style={{ marginTop: 10, marginBottom: 18 }}>
        Staggered NASA stills. Tap a tile for credit, story, and save actions.
      </Type>

      <View style={styles.row}>
        {FILTERS.map((item) => (
          <Pill key={item.id} label={item.label} active={filter === item.id} onPress={() => onSelectFilter(item.id)} />
        ))}
      </View>
    </View>
  );
});

const GalleryRow = memo(function GalleryRow({
  row,
  rowIndex,
}: {
  row: SpaceItem[];
  rowIndex: number;
}) {
  return (
    <View style={styles.columns}>
      {row.map((item, columnIndex) => {
        const itemIndex = rowIndex * 2 + columnIndex;
        const tall = itemIndex % 4 === 0 || itemIndex % 4 === 3;
        return (
          <View key={item.id} style={styles.col}>
            <SpaceCard item={item} layout="tile" height={tall ? 210 : 150} />
          </View>
        );
      })}
      {row.length === 1 ? <View style={styles.col} /> : null}
    </View>
  );
});

export default function GalleryScreen() {
  const { items: liveItems } = useApod();
  const [filter, setFilter] = useState<CategoryFilter>('all');

  const allItems = useMemo(() => {
    const map = new Map<string, SpaceItem>();
    liveItems.forEach((item) => map.set(item.id, item));
    CATALOG.forEach((item) => {
      if (!map.has(item.id)) map.set(item.id, item);
    });
    return Array.from(map.values());
  }, [liveItems]);

  const visible = useMemo(
    () => allItems.filter((item) => filter === 'all' || item.category === filter),
    [allItems, filter],
  );
  const rows = useMemo(() => {
    const next: SpaceItem[][] = [];
    for (let index = 0; index < visible.length; index += 2) next.push(visible.slice(index, index + 2));
    return next;
  }, [visible]);

  const header = useMemo(
    () => <GalleryHeader filter={filter} onSelectFilter={setFilter} />,
    [filter],
  );

  const renderItem = useCallback(
    ({ item, index }: ListRenderItemInfo<SpaceItem[]>) => (
      <GalleryRow row={item} rowIndex={index} />
    ),
    [],
  );

  return (
    <Screen>
      <FlatList
        data={rows}
        style={styles.list}
        contentContainerStyle={styles.listContent}
        keyExtractor={rowKeyExtractor}
        renderItem={renderItem}
        ItemSeparatorComponent={ItemSeparator}
        ListHeaderComponent={header}
        initialNumToRender={4}
        maxToRenderPerBatch={4}
        windowSize={5}
        showsVerticalScrollIndicator={false}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  list: {
    flex: 1,
  },
  listContent: {
    paddingBottom: 8,
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 18,
  },
  columns: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'flex-start',
  },
  col: {
    flex: 1,
  },
  separator: {
    height: 8,
  },
});
