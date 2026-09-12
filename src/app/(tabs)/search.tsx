import { SpaceCard } from '@/components/media/SpaceCard';
import { SearchPanel } from '@/components/search/SearchPanel';
import { Screen } from '@/components/ui/Screen';
import { Type } from '@/components/ui/Type';
import { filterCatalog } from '@/data/catalog';
import { useTheme } from '@/context/ThemeContext';
import { CategoryFilter, MediaFilter } from '@/types/space';
import { formatHudDate } from '@/utils/dates';
import { useMemo, useState } from 'react';
import { View } from 'react-native';

export default function SearchScreen() {
  const { colors } = useTheme();
  const [query, setQuery] = useState('');
  const [media, setMedia] = useState<MediaFilter>('all');
  const [category, setCategory] = useState<CategoryFilter>('all');
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const matches = useMemo(
    () => filterCatalog(query, media, category, selectedDate ?? undefined),
    [query, media, category, selectedDate],
  );

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
      />

      <Type variant="micro" color={colors.spark} style={{ marginTop: 28 }}>
        {selectedDate ? `Locked · ${formatHudDate(selectedDate)}` : `Matches · ${matches.length}`}
      </Type>
      <View style={{ marginTop: 12, gap: 12 }}>
        {matches.map((item) => (
          <SpaceCard key={item.id} item={item} />
        ))}
        {matches.length === 0 ? (
          <Type variant="body">No plates in this static archive match those filters.</Type>
        ) : null}
      </View>
    </Screen>
  );
}
