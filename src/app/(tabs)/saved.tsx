import { SpaceCard } from '@/components/media/SpaceCard';
import { Pill } from '@/components/ui/Chrome';
import { Screen } from '@/components/ui/Screen';
import { Type } from '@/components/ui/Type';
import { useFavorites } from '@/context/FavoritesContext';
import { useTheme } from '@/context/ThemeContext';
import { radius } from '@/theme';
import { FlatList, StyleSheet, View } from 'react-native';

export default function SavedScreen() {
  const { items, error, canReset, retry, reset } = useFavorites();
  const { colors } = useTheme();

  const header = (
    <View>
      <View style={{ paddingRight: 36 }}>
        <Type variant="micro" color={colors.gold}>
          Favorites
        </Type>
        <Type variant="headline" style={{ marginTop: 10 }}>
          Nights you held onto.
        </Type>
      </View>
      <Type variant="body" style={{ marginTop: 10, marginBottom: 22 }}>
        Kept plates live on this device for the session. Open one to share or save the still.
      </Type>

      {error ? (
        <View style={[styles.error, { backgroundColor: colors.panel, borderColor: colors.hairline }]}>
          <Type variant="micro" color={colors.spark} style={{ flex: 1 }}>
            {error}
          </Type>
          <Pill label="Retry" onPress={retry} />
          {canReset ? <Pill label="Reset" onPress={reset} /> : null}
        </View>
      ) : null}
    </View>
  );

  const empty = (
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
  );

  return (
    <Screen>
      <FlatList
        data={items}
        style={styles.list}
        contentContainerStyle={styles.listContent}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <SpaceCard item={item} />}
        ItemSeparatorComponent={<View style={styles.separator} />}
        ListHeaderComponent={header}
        ListEmptyComponent={empty}
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
    paddingBottom: 12,
  },
  separator: {
    height: 12,
  },
  error: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    padding: 12,
    borderRadius: radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    marginBottom: 16,
  },
});
