import { ApodHero } from '@/components/home/ApodHero';
import { DateStrip } from '@/components/home/DateStrip';
import { SpaceCard } from '@/components/media/SpaceCard';
import { Hairline } from '@/components/ui/Chrome';
import { Screen } from '@/components/ui/Screen';
import { Type } from '@/components/ui/Type';
import { CATALOG, TODAY } from '@/data/catalog';
import { useTheme } from '@/context/ThemeContext';
import { View } from 'react-native';

export default function HomeScreen() {
  const recents = CATALOG.slice(1, 8);
  const { colors } = useTheme();

  return (
    <Screen scroll>
      <Type variant="micro" color={colors.gold}>
        Home
      </Type>
      <Type variant="headline" style={{ marginTop: 8 }}>
        Tonight’s sky, held still.
      </Type>
      <Type variant="body" style={{ marginTop: 8, marginBottom: 18 }}>
        A quiet list of NASA Astronomy Pictures. Open any plate for the full story.
      </Type>

      <DateStrip activeId={TODAY.id} />

      <View style={{ marginTop: 20 }}>
        <ApodHero item={TODAY} />
      </View>

      <View style={{ marginTop: 32 }}>
        <Type variant="micro" color={colors.spark}>
          Recent skies
        </Type>
        <Hairline style={{ marginTop: 12, marginBottom: 14 }} />
        {recents.map((item) => (
          <View key={item.id} style={{ marginBottom: 12 }}>
            <SpaceCard item={item} />
          </View>
        ))}
      </View>
    </Screen>
  );
}
