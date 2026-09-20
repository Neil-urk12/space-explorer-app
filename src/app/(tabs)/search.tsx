import { SpaceCard } from '@/components/media/SpaceCard';
import { SearchPanel } from '@/components/search/SearchPanel';
import { Screen } from '@/components/ui/Screen';
import { Type } from '@/components/ui/Type';
import { useApod } from '@/context/ApodContext';
import { useTheme } from '@/context/ThemeContext';
import { CATALOG } from '@/data/catalog';
import { CategoryFilter, MediaFilter, SpaceItem } from '@/types/space';
import { formatHudDate } from '@/utils/dates';
import { memo, useCallback, useDeferredValue, useMemo, useState } from 'react';
import { FlatList, ListRenderItemInfo, StyleSheet, View } from 'react-native';

function ItemSeparator() {
  return <View style={styles.separator} />;
}

function itemKeyExtractor(item: SpaceItem): string {
  return item.id;
}

const ListEmpty = memo(function ListEmpty() {
  return <Type variant="body" style={styles.empty}>No plates in the archive match those filters.</Type>;
});

const SearchHeader = memo(function SearchHeader({
  query,
  onQuery,
  media,
  onMedia,
  category,
  onCategory,
  selectedDate,
  onSelectDate,
  availableDates,
  matchCount,
  allItems,
}: {
  query: string;
  onQuery: (value: string) => void;
  media: MediaFilter;
  onMedia: (value: MediaFilter) => void;
  category: CategoryFilter;
  onCategory: (value: CategoryFilter) => void;
  selectedDate: string | null;
  onSelectDate: (value: string | null) => void;
  availableDates: Set<string>;
  matchCount: number;
  allItems: SpaceItem[];
}) {
  const { colors } = useTheme();

  return (
    <View>
      <SearchPanel
        query={query}
        onQuery={onQuery}
        media={media}
        onMedia={onMedia}
        category={category}
        onCategory={onCategory}
        selectedDate={selectedDate}
        onSelectDate={onSelectDate}
        availableDates={availableDates}
        items={allItems}
      />

      <Type variant="micro" color={colors.spark} style={{ marginTop: 20 }}>
        {selectedDate ? `Locked · ${formatHudDate(selectedDate)} (${matchCount})` : `Matches · ${matchCount}`}
      </Type>
    </View>
  );
});

export default function SearchScreen() {
  const { items: liveItems } = useApod();
  const [query, setQuery] = useState('');
  const [media, setMedia] = useState<MediaFilter>('all');
  const [category, setCategory] = useState<CategoryFilter>('all');
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const deferredQuery = useDeferredValue(query);

  const allItems = useMemo(() => {
    const map = new Map<string, SpaceItem>();
    liveItems.forEach((item) => map.set(item.id, item));
    CATALOG.forEach((item) => {
      if (!map.has(item.id)) map.set(item.id, item);
    });
    return Array.from(map.values());
  }, [liveItems]);

  const availableDates = useMemo(() => new Set(allItems.map((item) => item.date)), [allItems]);

  const matches = useMemo(() => {
    const needle = deferredQuery.trim().toLowerCase();
    return allItems.filter((item) => {
      if (selectedDate && item.date !== selectedDate) return false;
      if (media !== 'all' && item.mediaType !== media) return false;
      if (category !== 'all' && item.category !== category) return false;
      if (!needle) return true;
      return `${item.title} ${item.explanation} ${item.credit}`.toLowerCase().includes(needle);
    });
  }, [allItems, deferredQuery, media, category, selectedDate]);

  const header = useMemo(
    () => (
      <SearchHeader
        query={query}
        onQuery={setQuery}
        media={media}
        onMedia={setMedia}
        category={category}
        onCategory={setCategory}
        selectedDate={selectedDate}
        onSelectDate={setSelectedDate}
        availableDates={availableDates}
        matchCount={matches.length}
        allItems={allItems}
      />
    ),
    [query, media, category, selectedDate, availableDates, matches.length, allItems],
  );

  const renderItem = useCallback(
    ({ item }: ListRenderItemInfo<SpaceItem>) => <SpaceCard item={item} />,
    [],
  );

  return (
    <Screen hasSky={false}>
      <FlatList
        data={matches}
        style={styles.list}
        contentContainerStyle={styles.listContent}
        keyExtractor={itemKeyExtractor}
        renderItem={renderItem}
        ItemSeparatorComponent={ItemSeparator}
        ListHeaderComponent={header}
        ListEmptyComponent={ListEmpty}
        initialNumToRender={4}
        maxToRenderPerBatch={4}
        windowSize={5}
        keyboardShouldPersistTaps="handled"
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
    paddingBottom: 12,
  },
  separator: {
    height: 12,
  },
  empty: {
    marginTop: 12,
  },
});
