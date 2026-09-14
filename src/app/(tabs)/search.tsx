import { SpaceCard } from '@/components/media/SpaceCard';
import { SearchPanel } from '@/components/search/SearchPanel';
import { Screen } from '@/components/ui/Screen';
import { Type } from '@/components/ui/Type';
import { useApod } from '@/context/ApodContext';
import { useTheme } from '@/context/ThemeContext';
import { CATALOG } from '@/data/catalog';
import { CategoryFilter, MediaFilter, SpaceItem } from '@/types/space';
import { formatHudDate } from '@/utils/dates';
import { useMemo, useState } from 'react';
import { View } from 'react-native';

export default function SearchScreen() {
  const { colors } = useTheme();
  const { items: liveItems } = useApod();
  const [query, setQuery] = useState('');
  const [media, setMedia] = useState<MediaFilter>('all');
  const [category, setCategory] = useState<CategoryFilter>('all');
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

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
    const needle = query.trim().toLowerCase();
    return allItems.filter((item) => {
      if (selectedDate && item.date !== selectedDate) return false;
      if (media !== 'all' && item.mediaType !== media) return false;
      if (category !== 'all' && item.category !== category) return false;
      if (!needle) return true;
      return `${item.title} ${item.explanation} ${item.credit}`.toLowerCase().includes(needle);
    });
  }, [allItems, query, media, category, selectedDate]);

  return (
    <Screen scroll>
      <SearchPanel
        query={query}
        onQuery={setQuery}
        media={media}
        onMedia={setMedia}
        category={category}
        onCategory={setCategory}
        selectedDate={selectedDate}
        onSelectDate={setSelectedDate}
        availableDates={availableDates}
      />

      <Type variant="micro" color={colors.spark} style={{ marginTop: 28 }}>
        {selectedDate ? `Locked · ${formatHudDate(selectedDate)}` : `Matches · ${matches.length}`}
      </Type>
      <View style={{ marginTop: 12, gap: 12 }}>
        {matches.map((item) => (
          <SpaceCard key={item.id} item={item} />
        ))}
        {matches.length === 0 ? (
          <Type variant="body">No plates in the archive match those filters.</Type>
        ) : null}
      </View>
    </Screen>
  );
}
