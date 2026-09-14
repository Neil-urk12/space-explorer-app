import { SpaceCard } from '@/components/media/SpaceCard';
import { Pill } from '@/components/ui/Chrome';
import { Screen } from '@/components/ui/Screen';
import { Type } from '@/components/ui/Type';
import { useApod } from '@/context/ApodContext';
import { CATALOG } from '@/data/catalog';
import { useTheme } from '@/context/ThemeContext';
import { CategoryFilter, SpaceItem } from '@/types/space';
import { useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';

const FILTERS: { id: CategoryFilter; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'galaxy', label: 'Galaxies' },
  { id: 'nebula', label: 'Nebulae' },
  { id: 'planet', label: 'Planets' },
  { id: 'earth', label: 'Earth' },
  { id: 'moon', label: 'Moon' },
];

export default function GalleryScreen() {
  const { colors } = useTheme();
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
  const left = visible.filter((_, index) => index % 2 === 0);
  const right = visible.filter((_, index) => index % 2 === 1);

  return (
    <Screen scroll>
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
          <Pill key={item.id} label={item.label} active={filter === item.id} onPress={() => setFilter(item.id)} />
        ))}
      </View>

      <View style={styles.columns}>
        <View style={styles.col}>
          {left.map((item, index) => (
            <View key={item.id} style={{ marginBottom: 8 }}>
              <SpaceCard item={item} layout="tile" height={index % 2 === 0 ? 210 : 150} />
            </View>
          ))}
        </View>
        <View style={styles.col}>
          {right.map((item, index) => (
            <View key={item.id} style={{ marginBottom: 8 }}>
              <SpaceCard item={item} layout="tile" height={index % 2 === 0 ? 150 : 210} />
            </View>
          ))}
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 18,
  },
  columns: {
    flexDirection: 'row',
    gap: 8,
  },
  col: {
    flex: 1,
  },
});
