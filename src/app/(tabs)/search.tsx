import { SpaceCard } from '@/components/media/SpaceCard';
import { SearchPanel } from '@/components/search/SearchPanel';
import { Screen } from '@/components/ui/Screen';
import { Type } from '@/components/ui/Type';
import { useApod } from '@/context/ApodContext';
import { useTheme } from '@/context/ThemeContext';
import { fetchApodByDate } from '@/services/apod';
import { CategoryFilter, SpaceItem } from '@/types/space';
import { memo, useCallback, useDeferredValue, useMemo, useState } from 'react';
import { FlatList, ListRenderItemInfo, StyleSheet, View } from 'react-native';

function ItemSeparator() {
  return <View style={styles.separator} />;
}

function itemKeyExtractor(item: SpaceItem): string {
  return item.id;
}

const SearchHeader = memo(function SearchHeader({
  query,
  onQuery,
  category,
  onCategory,
  selectedDate,
  onSelectDate,
  availableDates,
}: {
  query: string;
  onQuery: (value: string) => void;
  category: CategoryFilter;
  onCategory: (value: CategoryFilter) => void;
  selectedDate: string | null;
  onSelectDate: (value: string | null) => void;
  availableDates: Set<string>;
}) {
  const { colors } = useTheme();
  return (
    <View>
      <SearchPanel
        filters={false}
        query={query}
        onQuery={onQuery}
        category={category}
        onCategory={onCategory}
        selectedDate={selectedDate}
        onSelectDate={onSelectDate}
        availableDates={availableDates}
      />
      <View style={styles.photoHead}>
        <View style={[styles.photoRule, { backgroundColor: colors.star }]} />
        <Type variant="micro" color={colors.gold}>
          The photographs
        </Type>
        <Type variant="headline" style={styles.photoTitle}>
          Frames of our daily cosmos
        </Type>
        <Type variant="body" style={styles.photoLine}>
          Each picture is the one NASA published that day.
        </Type>
      </View>
    </View>
  );
});

export default function SearchScreen() {
  const { items: liveItems, loading, error, isRateLimited } = useApod();
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<CategoryFilter>('all');
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [extra, setExtra] = useState<SpaceItem[]>([]);
  const [fetchingDate, setFetchingDate] = useState(false);

  const deferredQuery = useDeferredValue(query);

  const allItems = useMemo(() => {
    const map = new Map<string, SpaceItem>();
    extra.forEach((item) => map.set(item.id, item));
    liveItems.forEach((item) => map.set(item.id, item));
    return Array.from(map.values()).sort((a, b) => b.date.localeCompare(a.date));
  }, [liveItems, extra]);

  const chooseDate = useCallback((iso: string | null) => {
    setSelectedDate(iso);
    if (!iso || allItems.some((item) => item.date === iso)) {
      setFetchingDate(false);
      return;
    }
    setFetchingDate(true);
    void fetchApodByDate(iso)
      .then((item) => {
        if (!item) return;
        setExtra((current) => [item, ...current.filter((entry) => entry.id !== item.id)]);
      })
      .finally(() => setFetchingDate(false));
  }, [allItems]);

  const availableDates = useMemo(() => new Set(allItems.map((item) => item.date)), [allItems]);

  const matches = useMemo(() => {
    const needle = deferredQuery.trim().toLowerCase();
    return allItems.filter((item) => {
      if (selectedDate && item.date !== selectedDate) return false;
      if (category !== 'all' && item.category !== category) return false;
      if (!needle) return true;
      return `${item.title} ${item.explanation} ${item.credit}`.toLowerCase().includes(needle);
    });
  }, [allItems, deferredQuery, category, selectedDate]);

  const header = useMemo(
    () => (
      <SearchHeader
        query={query}
        onQuery={setQuery}
        category={category}
        onCategory={setCategory}
        selectedDate={selectedDate}
        onSelectDate={chooseDate}
        availableDates={availableDates}
      />
    ),
    [query, category, selectedDate, availableDates, chooseDate],
  );

  const renderItem = useCallback(({ item }: ListRenderItemInfo<SpaceItem>) => {
    return <SpaceCard item={item} layout="plate" />;
  }, []);

  const emptyMessage = loading || fetchingDate
    ? 'Loading NASA plates…'
    : selectedDate
      ? 'No plate for that night yet. Clear the date lock or pick another day.'
      : isRateLimited || error
        ? 'Archive is offline right now. Pull from Home to retry.'
        : 'No plates in the archive match those filters.';

  return (
    <Screen hasSky={false}>
      <SearchPanel
        calendar={false}
        query={query}
        onQuery={setQuery}
        category={category}
        onCategory={setCategory}
        selectedDate={selectedDate}
        onSelectDate={chooseDate}
        availableDates={availableDates}
      />
      <FlatList
        key={`${category}-${selectedDate ?? 'any'}`}
        data={matches}
        style={styles.list}
        contentContainerStyle={styles.listContent}
        keyExtractor={itemKeyExtractor}
        renderItem={renderItem}
        ItemSeparatorComponent={ItemSeparator}
        ListHeaderComponent={header}
        ListEmptyComponent={<Type variant="body" style={styles.empty}>{emptyMessage}</Type>}
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
    flexGrow: 1,
  },
  separator: {
    height: 22,
  },
  columns: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-start',
  },
  col: {
    flex: 1,
  },
  empty: {
    marginTop: 12,
  },
  photoHead: {
    marginTop: 22,
    marginBottom: 18,
    gap: 8,
  },
  photoRule: {
    width: 28,
    height: 2,
    marginBottom: 4,
  },
  photoTitle: {
    fontSize: 26,
    lineHeight: 30,
  },
  photoLine: {
    maxWidth: 320,
  },
});
