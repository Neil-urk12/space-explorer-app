import { Mark } from '@/components/ui/Marks';
import { Type } from '@/components/ui/Type';
import { useFavorites } from '@/context/FavoritesContext';
import { useTheme } from '@/context/ThemeContext';
import { radius } from '@/theme';
import { previewUrl, SpaceItem } from '@/types/space';
import { formatHudDate } from '@/utils/dates';
import { detailsHref } from '@/utils/navigation';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

type Props = {
  item: SpaceItem;
  layout?: 'row' | 'tile';
  height?: number;
};

export function SpaceCard({ item, layout = 'row', height = 168 }: Props) {
  const { isFavorite, toggleFavorite } = useFavorites();
  const { colors } = useTheme();
  const kept = isFavorite(item.id);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={item.title}
      onPress={() => router.push(detailsHref(item.id))}
      style={({ pressed }) => [
        layout === 'tile' ? styles.tile : styles.row,
        { borderColor: colors.hairline, backgroundColor: colors.panel },
        pressed && { opacity: 0.88 },
      ]}
    >
      <View style={[styles.media, { backgroundColor: colors.panelHot }, layout === 'tile' ? { height } : styles.rowMedia]}>
        <Image source={{ uri: previewUrl(item) }} style={StyleSheet.absoluteFill} contentFit="cover" transition={120} />
        <LinearGradient colors={['transparent', 'rgba(0,0,0,0.72)']} style={styles.fade} />
        <View style={[styles.badge, { borderColor: colors.hairline }]}>
          <Type variant="micro" color="#F4F7FF">
            {item.mediaType}
          </Type>
        </View>
        {item.mediaType === 'video' ? (
          <View style={styles.play}>
            <Mark name="play" size={16} />
          </View>
        ) : null}
      </View>
      <View style={styles.copy}>
        <View style={styles.copyTop}>
          <Type variant="micro">{formatHudDate(item.date)}</Type>
          <Pressable
            onPress={(event) => {
              event.stopPropagation?.();
              toggleFavorite(item);
            }}
            hitSlop={10}
          >
            <Mark name={kept ? 'heartFill' : 'heart'} active={kept} size={14} />
          </Pressable>
        </View>
        <Type variant="title" numberOfLines={layout === 'tile' ? 3 : 2} style={{ marginTop: 6 }}>
          {item.title}
        </Type>
        <Type variant="micro" style={{ marginTop: 8 }} numberOfLines={1}>
          {item.credit}
        </Type>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
    borderRadius: radius.md,
  },
  tile: {
    flex: 1,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
    borderRadius: radius.md,
  },
  media: {
    overflow: 'hidden',
  },
  rowMedia: {
    height: 168,
  },
  fade: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 64,
  },
  badge: {
    position: 'absolute',
    left: 10,
    top: 10,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: 'rgba(0,0,0,0.62)',
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: radius.full,
  },
  play: {
    position: 'absolute',
    right: 10,
    bottom: 10,
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.62)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(186, 210, 255, 0.16)',
    borderRadius: 14,
  },
  copy: {
    padding: 14,
  },
  copyTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});
