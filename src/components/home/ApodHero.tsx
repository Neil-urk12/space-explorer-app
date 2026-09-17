import { Mark } from '@/components/ui/Marks';
import { Type } from '@/components/ui/Type';
import { useIsFavorite, useToggleFavorite } from '@/context/FavoritesContext';
import { useTheme } from '@/context/ThemeContext';
import { radius } from '@/theme';
import { previewUrl, SpaceItem } from '@/types/space';
import { formatHudDate } from '@/utils/dates';
import { detailsHref } from '@/utils/navigation';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { memo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

export const ApodHero = memo(function ApodHero({ item }: { item: SpaceItem }) {
  const kept = useIsFavorite(item.id);
  const toggleFavorite = useToggleFavorite();
  const { colors } = useTheme();

  return (
    <Pressable
      onPress={() => router.push(detailsHref(item.id))}
      style={({ pressed }) => [
        styles.wrap,
        { borderColor: colors.hairlineStrong, backgroundColor: colors.panelHot },
        pressed && { opacity: 0.92 },
      ]}
    >
      <Image source={{ uri: previewUrl(item) }} style={StyleSheet.absoluteFill} contentFit="cover" transition={400} />
      <LinearGradient colors={['rgba(0,0,0,0.1)', 'rgba(0,0,0,0.82)']} style={StyleSheet.absoluteFill} />
      <View style={styles.top}>
        <Type variant="micro" color={colors.gold}>
          Astronomy Picture of the Day
        </Type>
        <Pressable
          onPress={(event) => {
            event.stopPropagation?.();
            toggleFavorite(item);
          }}
          hitSlop={12}
        >
          <Mark name={kept ? 'heartFill' : 'heart'} active={kept} size={16} />
        </Pressable>
      </View>
      <View>
        <Type variant="numeric" color={colors.spark}>
          {formatHudDate(item.date)}
        </Type>
        <Type variant="headline" numberOfLines={2} style={{ marginTop: 8, color: '#F4F7FF' }}>
          {item.title}
        </Type>
        <Type variant="body" numberOfLines={2} style={{ marginTop: 8, color: '#F4F7FF' }}>
          {item.explanation}
        </Type>
      </View>
    </Pressable>
  );
});

const styles = StyleSheet.create({
  wrap: {
    height: 300,
    borderRadius: radius.lg,
    overflow: 'hidden',
    borderWidth: StyleSheet.hairlineWidth,
    justifyContent: 'space-between',
    padding: 18,
  },
  top: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});
