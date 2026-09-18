import { SpaceCard } from '@/components/media/SpaceCard';
import { Pill } from '@/components/ui/Chrome';
import { Screen } from '@/components/ui/Screen';
import { Type } from '@/components/ui/Type';
import { useFavorites } from '@/context/FavoritesContext';
import { useTheme } from '@/context/ThemeContext';
import { radius } from '@/theme';
import { SpaceItem } from '@/types/space';
import { memo, useCallback, useMemo } from 'react';
import { FlatList, ListRenderItemInfo, StyleSheet, View } from 'react-native';

function ItemSeparator() {
  return <View style={styles.separator} />;
}

function itemKeyExtractor(item: SpaceItem): string {
  return item.id;
}

const SavedHeader = memo(function SavedHeader({
  error,
  canReset,
  retry,
  reset,
}: {
  error: string | null;
  canReset: boolean;
  retry: () => void;
  reset: () => void;
}) {
  const { colors } = useTheme();

  return (
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
});

const SavedEmpty = memo(function SavedEmpty() {
  const { colors } = useTheme();

  return (
    <View
      style={[
        styles.emptyBox,
        {
          borderColor: colors.hairline,
          backgroundColor: colors.panel,
        },
      ]}
    >
      <Type variant="label" color={colors.spark}>
        Empty vault
      </Type>
      <Type variant="body" style={{ marginTop: 10 }}>
        Keep a night from Home, Gallery, or a detail plate. It will gather here.
      </Type>
    </View>
  );
});

export default function SavedScreen() {
  const { items, error, canReset, retry, reset } = useFavorites();

  const header = useMemo(
    () => <SavedHeader error={error} canReset={canReset} retry={retry} reset={reset} />,
    [error, canReset, retry, reset],
  );

  const renderItem = useCallback(
    ({ item }: ListRenderItemInfo<SpaceItem>) => <SpaceCard item={item} />,
    [],
  );

  return (
    <Screen>
      <FlatList
        data={items}
        style={styles.list}
        contentContainerStyle={styles.listContent}
        keyExtractor={itemKeyExtractor}
        renderItem={renderItem}
        ItemSeparatorComponent={ItemSeparator}
        ListHeaderComponent={header}
        ListEmptyComponent={SavedEmpty}
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
  emptyBox: {
    borderWidth: 1,
    padding: 22,
    borderRadius: radius.md,
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
