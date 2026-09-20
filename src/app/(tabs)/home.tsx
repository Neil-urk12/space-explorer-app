import { ApodHero } from '@/components/home/ApodHero';
import { DateStrip } from '@/components/home/DateStrip';
import { SpaceCard } from '@/components/media/SpaceCard';
import { Hairline, Pill } from '@/components/ui/Chrome';
import { Screen } from '@/components/ui/Screen';
import { Type } from '@/components/ui/Type';
import { useApod } from '@/context/ApodContext';
import { useTheme } from '@/context/ThemeContext';
import { radius } from '@/theme';
import { ActivityIndicator, RefreshControl, StyleSheet, View } from 'react-native';

export default function HomeScreen() {
  const { colors } = useTheme();
  const { today, recents, items, loading, refreshing, isFallback, isRateLimited, error, refresh } = useApod();

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
      <View style={{ paddingRight: 36 }}>
        <Type variant="micro" color={colors.gold}>
          NASA · Live APOD
        </Type>
        <Type variant="headline" style={{ marginTop: 8 }}>
          Tonight’s sky, held still.
        </Type>
      </View>
      <Type variant="body" style={{ marginTop: 8, marginBottom: 18 }}>
        A live stream of NASA Astronomy Pictures. Open any plate for the full story.
      </Type>

      {/* Network / Rate-limit Banner */}
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
              NASA DEMO_KEY hourly limit reached. Displaying cached / offline archive.
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
      ) : null}

      {loading ? (
        <View
          accessible
          accessibilityRole="progressbar"
          accessibilityLabel="Contacting NASA APOD"
          accessibilityLiveRegion="polite"
          style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 14 }}
        >
          <ActivityIndicator size="small" color={colors.spark} />
          <Type variant="micro" color={colors.muted}>
            Contacting NASA APOD…
          </Type>
        </View>
      ) : null}

      <DateStrip activeId={today?.id} items={items} />

      {today ? (
        <View style={{ marginTop: 20 }}>
          <ApodHero item={today} />
        </View>
      ) : null}

      <View style={{ marginTop: 32 }}>
        <Type variant="micro" color={colors.spark}>
          Recent skies {isFallback ? '· Offline Archive' : '· Live NASA feed'}
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

const styles = StyleSheet.create({
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
