import { Hairline, IconButton, Toast } from '@/components/ui/Chrome';
import { Mark } from '@/components/ui/Marks';
import { Screen } from '@/components/ui/Screen';
import { Type } from '@/components/ui/Type';
import { useApod } from '@/context/ApodContext';
import { useFavorites } from '@/context/FavoritesContext';
import { useTheme } from '@/context/ThemeContext';
import { fetchApodByDate, getCachedApodItems } from '@/services/apod';
import { radius } from '@/theme';
import { previewUrl, SpaceItem } from '@/types/space';
import { formatHudDate } from '@/utils/dates';
import { detailsHref } from '@/utils/navigation';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, Share, StyleSheet, View } from 'react-native';

export default function DetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getItemById, getNeighbors } = useApod();
  const contextItem = id ? getItemById(id) : undefined;
  const [fetchedItem, setFetchedItem] = useState<SpaceItem | null>(null);
  const [loading, setLoading] = useState(false);
  const { items: favoriteItems, hydrated: favoritesHydrated, isFavorite, toggleFavorite } = useFavorites();
  const { colors } = useTheme();
  const [notice, setNotice] = useState<string | null>(null);

  const favoriteItem = id ? favoriteItems.find((favorite) => favorite.id === id) : undefined;
  const item = contextItem || favoriteItem || fetchedItem;

  useEffect(() => {
    if (contextItem || favoriteItem || !favoritesHydrated || !id) return;

    let cancelled = false;
    setLoading(true);
    getCachedApodItems()
      .then((cached) => {
        const cachedItem = cached.find((candidate) => candidate.id === id);
        if (cachedItem) {
          if (!cancelled) setFetchedItem(cachedItem);
          return null;
        }
        return fetchApodByDate(id);
      })
      .then((result) => {
        if (!cancelled && result) setFetchedItem(result);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [contextItem, favoriteItem, favoritesHydrated, id]);

  const handleShare = async () => {
    if (!item) return;
    try {
      await Share.share({
        title: item.title,
        message: `${item.title} (${item.date})\n${item.explanation}\n\nNASA APOD: ${item.url}`,
      });
    } catch {
      setNotice('Unable to share item.');
    }
  };

  const handleOpenVideo = async () => {
    if (!item || item.mediaType !== 'video') return;
    try {
      await WebBrowser.openBrowserAsync(item.url);
    } catch {
      setNotice('Could not open video URL.');
    }
  };

  if (loading || (!item && !favoritesHydrated)) {
    return (
      <Screen tabInset={false}>
        <BackBar />
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={colors.spark} />
          <Type variant="micro" color={colors.muted} style={{ marginTop: 12 }}>
            Loading plate from NASA…
          </Type>
        </View>
      </Screen>
    );
  }

  if (!item) {
    return (
      <Screen tabInset={false}>
        <BackBar />
        <Type variant="headline" style={{ marginTop: 18 }}>
          This plate drifted out of the archive.
        </Type>
      </Screen>
    );
  }

  const kept = isFavorite(item.id);
  const { prev, next } = getNeighbors(item.id);

  return (
    <Screen tabInset={false} scroll padded={false}>
      <View style={{ paddingHorizontal: 20, paddingRight: 56 }}>
        <BackBar />
        <View style={styles.kicker}>
          <Type variant="micro" color={colors.gold}>
            NASA · {formatHudDate(item.date)}
          </Type>
          <Type variant="micro">{item.mediaType}</Type>
        </View>
        <Type variant="headline" style={{ marginTop: 12 }}>
          {item.title}
        </Type>
      </View>

      <View style={[styles.stage, { backgroundColor: colors.panelHot }]}>
        <Image source={{ uri: previewUrl(item) }} style={StyleSheet.absoluteFill} contentFit="cover" transition={350} />
        <LinearGradient colors={['transparent', 'rgba(0,0,0,0.45)']} style={styles.stageFade} />
        {item.mediaType === 'video' ? (
          <Pressable
            onPress={handleOpenVideo}
            style={[styles.playBadge, { backgroundColor: 'rgba(0,0,0,0.65)', borderColor: colors.gold }]}
            accessibilityRole="button"
            accessibilityLabel="Play Video"
          >
            <Mark name="play" size={20} active />
            <Type variant="micro" color={colors.gold} style={{ marginLeft: 6 }}>
              Watch Video
            </Type>
          </Pressable>
        ) : null}
        <View style={[styles.stageHud, { borderColor: colors.hairline }]}>
          <Type variant="micro" color="#F4F7FF">
            {item.category} · {item.credit}
          </Type>
        </View>
      </View>

      <View style={{ paddingHorizontal: 20, paddingTop: 16 }}>
        <View style={styles.tools}>
          <IconButton label={kept ? 'Kept' : 'Keep'} active={kept} onPress={() => toggleFavorite(item)}>
            <Mark name={kept ? 'heartFill' : 'heart'} active={kept} size={16} />
          </IconButton>
          <IconButton label="Share" onPress={handleShare}>
            <Mark name="share" size={16} />
          </IconButton>
          {item.mediaType === 'video' ? (
            <IconButton label="Watch" onPress={handleOpenVideo}>
              <Mark name="play" size={16} active />
            </IconButton>
          ) : (
            <IconButton
              label="Saved"
              onPress={() => setNotice('Image marked as saved to your collection.')}
            >
              <Mark name="save" size={16} />
            </IconButton>
          )}
        </View>

        {notice ? <Toast message={notice} /> : null}

        <Hairline style={{ marginVertical: 18 }} />

        <Type variant="micro" style={{ marginBottom: 12 }}>
          Credit · {item.credit}
        </Type>
        <Type variant="body" color={colors.star} style={{ lineHeight: 24 }}>
          {item.explanation}
        </Type>

        <View style={styles.adjacent}>
          {prev ? (
            <Pressable
              onPress={() => router.replace(detailsHref(prev.id))}
              style={[styles.adjBtn, { borderColor: colors.hairline, backgroundColor: colors.panel }]}
            >
              <Type variant="micro">Previous</Type>
              <Type variant="numeric" style={{ marginTop: 6 }} numberOfLines={2}>
                {prev.title}
              </Type>
            </Pressable>
          ) : (
            <View style={styles.adjBtn} />
          )}
          {next ? (
            <Pressable
              onPress={() => router.replace(detailsHref(next.id))}
              style={[styles.adjBtn, { borderColor: colors.hairline, backgroundColor: colors.panel }]}
            >
              <Type variant="micro">Following</Type>
              <Type variant="numeric" style={{ marginTop: 6 }} numberOfLines={2}>
                {next.title}
              </Type>
            </Pressable>
          ) : (
            <View style={styles.adjBtn} />
          )}
        </View>
      </View>
    </Screen>
  );
}

function BackBar() {
  const { colors } = useTheme();
  return (
    <Pressable onPress={() => router.back()} style={styles.back} accessibilityRole="button" accessibilityLabel="Close">
      <Mark name="back" size={16} />
      <Type variant="micro" color={colors.star}>
        Close
      </Type>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  kicker: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  stage: {
    marginTop: 18,
    height: 300,
    marginHorizontal: 20,
    borderRadius: radius.lg,
    overflow: 'hidden',
  },
  stageFade: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 80,
  },
  playBadge: {
    position: 'absolute',
    top: '40%',
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: radius.full,
    borderWidth: 1,
    zIndex: 10,
  },
  stageHud: {
    position: 'absolute',
    left: 14,
    bottom: 14,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: 'rgba(0,0,0,0.62)',
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: radius.full,
  },
  tools: {
    flexDirection: 'row',
    gap: 8,
  },
  adjacent: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 28,
  },
  adjBtn: {
    flex: 1,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 14,
    borderRadius: radius.md,
  },
  back: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    alignSelf: 'flex-start',
    paddingVertical: 8,
  },
});
