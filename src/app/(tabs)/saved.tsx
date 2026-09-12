import { SpaceCard } from '@/components/media/SpaceCard';
import { Screen } from '@/components/ui/Screen';
import { Type } from '@/components/ui/Type';
import { useFavorites } from '@/context/FavoritesContext';
import { useTheme } from '@/context/ThemeContext';
import { radius } from '@/theme';
import { View } from 'react-native';

export default function SavedScreen() {
  const { items } = useFavorites();
  const { colors } = useTheme();

  return (
    <Screen scroll>
      <Type variant="micro" color={colors.gold}>
        Favorites
      </Type>
      <Type variant="headline" style={{ marginTop: 10 }}>
        Nights you held onto.
      </Type>
      <Type variant="body" style={{ marginTop: 10, marginBottom: 22 }}>
        Kept plates live on this device for the session. Open one to share or save the still.
      </Type>

      {items.length === 0 ? (
        <View
          style={{
            borderWidth: 1,
            borderColor: colors.hairline,
            padding: 22,
            backgroundColor: colors.panel,
            borderRadius: radius.md,
          }}
        >
          <Type variant="label" color={colors.spark}>
            Empty vault
          </Type>
          <Type variant="body" style={{ marginTop: 10 }}>
            Keep a night from Home, Gallery, or a detail plate. It will gather here.
          </Type>
        </View>
      ) : (
        <View style={{ gap: 12 }}>
          {items.map((item) => (
            <SpaceCard key={item.id} item={item} />
          ))}
        </View>
      )}
    </Screen>
  );
}
