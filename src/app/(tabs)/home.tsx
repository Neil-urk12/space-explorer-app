import { Mark } from '@/components/ui/Marks';
import { GlassPress } from '@/components/ui/GlassPress';
import { Pill } from '@/components/ui/Chrome';
import { Screen } from '@/components/ui/Screen';
import { Type } from '@/components/ui/Type';
import { useApod } from '@/context/ApodContext';
import { useTheme } from '@/context/ThemeContext';
import { radius } from '@/theme';
import { previewUrl, SpaceItem } from '@/types/space';
import { formatShortDate } from '@/utils/dates';
import { consumeExploreArrival, detailsHref } from '@/utils/navigation';
import { Image } from 'expo-image';
import { router, useIsFocused } from 'expo-router';
<<<<<<< HEAD
import { useEffect, useState } from 'react';
=======
import { useEffect } from 'react';
>>>>>>> 230a9b3 (feat: refresh Space Explorer UI, branding, and navigation)
import { ActivityIndicator, Pressable, RefreshControl, ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

export default function HomeScreen() {
  const { colors } = useTheme();
<<<<<<< HEAD
  const { today, items, loading, refreshing, isRateLimited, error, notice, refresh } = useApod();
  const [dismissedNotice, setDismissedNotice] = useState<string | null>(null);
=======
  const { today, items, loading, refreshing, isRateLimited, error, refresh } = useApod();
>>>>>>> 230a9b3 (feat: refresh Space Explorer UI, branding, and navigation)
  const earlier = items.filter((item) => item.id !== today?.id).slice(0, 8);
  const { width } = useWindowDimensions();
  const content = Math.max(280, width - 40);
  const photo = Math.round(Math.min(176, content * 0.44));
  const cardWidth = Math.round(Math.min(168, (content - 12) * 0.48));
  const focused = useIsFocused();
  const arrival = useSharedValue(1);

  useEffect(() => {
    if (!focused || !consumeExploreArrival()) return;
    arrival.value = 0;
    arrival.value = withTiming(1, { duration: 280, easing: Easing.out(Easing.cubic) });
  }, [arrival, focused]);

  const enter = useAnimatedStyle(() => ({
    opacity: arrival.value,
    transform: [{ translateX: (1 - arrival.value) * 72 }],
  }));

  return (
    <Screen
      hasSky={false}
      scroll
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={refresh}
          tintColor={colors.spark}
          colors={[colors.spark]}
        />
      }
    >
      <Animated.View style={enter}>
      {isRateLimited ? (
        <View
          style={[
            styles.banner,
            { backgroundColor: colors.panel, borderColor: colors.goldDim, borderLeftColor: colors.gold, borderLeftWidth: 3 },
          ]}
        >
          <View style={{ flex: 1 }}>
            <Type variant="micro" color={colors.gold}>
              API Rate Limit Notice
            </Type>
            <Type variant="body" style={{ marginTop: 4, fontSize: 13, lineHeight: 18 }}>
              NASA API hourly limit reached. Displaying cached / offline archive.
            </Type>
          </View>
          <Pill label="Retry" onPress={refresh} />
        </View>
      ) : error ? (
        <View
          style={[
            styles.banner,
            { backgroundColor: colors.panel, borderColor: colors.hairline, borderLeftColor: colors.spark, borderLeftWidth: 3 },
          ]}
        >
          <View style={{ flex: 1 }}>
            <Type variant="micro" color={colors.spark}>
              Offline Archive
            </Type>
            <Type variant="body" style={{ marginTop: 4, fontSize: 13, lineHeight: 18 }}>
              {error}
            </Type>
          </View>
          <Pill label="Retry" onPress={refresh} />
        </View>
      ) : notice && notice !== dismissedNotice ? (
        <View
          accessibilityLiveRegion="polite"
          style={[
            styles.banner,
            { backgroundColor: colors.panel, borderColor: colors.hairline, borderLeftColor: colors.spark, borderLeftWidth: 3 },
          ]}
        >
          <View style={{ flex: 1 }}>
            <Type variant="micro" color={colors.spark}>
              Switched Source
            </Type>
            <Type variant="body" style={{ marginTop: 4, fontSize: 13, lineHeight: 18 }}>
              {notice}
            </Type>
          </View>
          <Pill label="OK" onPress={() => setDismissedNotice(notice)} />
        </View>
      ) : null}

      {loading ? (
        <View
          accessible
          accessibilityRole="progressbar"
          accessibilityLabel="Contacting NASA APOD"
          accessibilityLiveRegion="polite"
          style={styles.loading}
        >
          <ActivityIndicator size="small" color={colors.spark} />
          <Type variant="micro" color={colors.muted}>
            Contacting NASA APOD…
          </Type>
        </View>
      ) : null}

      {today ? (
        <GlassPress
          accessibilityLabel={today.title}
          onPress={() => router.push(detailsHref(today.id))}
          radius={32}
          style={[styles.feature, { backgroundColor: colors.panel, borderColor: colors.hairline }]}
        >
          <View style={styles.featureCopy}>
            <Type variant="micro" color={colors.faint}>
              Today
            </Type>
            <Type variant="title" numberOfLines={4} style={styles.featureTitle}>
              {today.title}
            </Type>
            <View style={[styles.explore, { backgroundColor: colors.spark }]}>
              <Type variant="micro" color={colors.onAccent} style={styles.exploreLabel}>
                Explore
              </Type>
            </View>
          </View>
          {previewUrl(today) ? (
            <Image source={{ uri: previewUrl(today) }} style={[styles.featurePhoto, { width: photo, height: photo }]} contentFit="cover" />
          ) : (
            <View style={[styles.featurePhoto, { width: photo, height: photo, backgroundColor: colors.panelHot }]} />
          )}
        </GlassPress>
      ) : null}

      <View style={styles.sectionRow}>
        <Type variant="title" style={styles.section}>
          Nights before today
        </Type>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="See all"
          onPress={() => router.push({ pathname: '/gallery', params: { filter: 'all', at: String(Date.now()) } })}
          hitSlop={8}
        >
          <Type variant="micro" color={colors.spark}>
            See all
          </Type>
        </Pressable>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
        {earlier.map((item) => (
          <TodayCard key={item.id} item={item} width={cardWidth} />
        ))}
      </ScrollView>
      </Animated.View>
    </Screen>
  );
}

function TodayCard({ item, width }: { item: SpaceItem; width: number }) {
  const { colors } = useTheme();
  return (
    <GlassPress
      accessibilityLabel={item.title}
      onPress={() => router.push(detailsHref(item.id))}
      radius={22}
      style={[styles.card, { width, backgroundColor: colors.panel, borderColor: colors.hairline }]}
    >
      <View style={[styles.cardPhoto, { backgroundColor: colors.panelHot }]}>
        {previewUrl(item) ? <Image source={{ uri: previewUrl(item) }} style={StyleSheet.absoluteFill} contentFit="cover" /> : null}
      </View>
      <Type variant="title" numberOfLines={2} style={styles.cardTitle}>
        {item.title}
      </Type>
      <View style={styles.cardFoot}>
        <Type variant="micro" color={colors.muted} style={styles.cardDate}>
          {formatShortDate(item.date)}
        </Type>
        <View style={[styles.arrow, { borderColor: colors.hairline }]}>
          <Mark name="back" size={12} />
        </View>
      </View>
    </GlassPress>
  );
}

const styles = StyleSheet.create({
  loading: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 14,
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    borderRadius: 32,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 20,
    minHeight: 220,
  },
  featureCopy: {
    flex: 1,
    gap: 14,
  },
  featureTitle: {
    fontSize: 26,
    lineHeight: 30,
  },
  featurePhoto: {
    width: 176,
    height: 176,
    borderRadius: 22,
  },
  explore: {
    alignSelf: 'flex-start',
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  exploreLabel: {
    letterSpacing: 0.4,
    textTransform: 'none',
  },
  sectionRow: {
    marginTop: 28,
    marginBottom: 14,
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    gap: 12,
  },
  section: {
    flex: 1,
    fontSize: 22,
  },
  row: {
    gap: 12,
    paddingRight: 8,
  },
  card: {
    width: 168,
    borderRadius: 22,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 10,
  },
  cardPhoto: {
    height: 120,
    borderRadius: 16,
    overflow: 'hidden',
  },
  cardTitle: {
    marginTop: 10,
    fontSize: 14,
    lineHeight: 18,
    minHeight: 36,
  },
  cardFoot: {
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardDate: {
    letterSpacing: 0.4,
    textTransform: 'none',
  },
  arrow: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
    justifyContent: 'center',
    transform: [{ rotate: '180deg' }],
  },
  banner: {
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
