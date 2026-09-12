import { Mark } from '@/components/ui/Marks';
import { Type } from '@/components/ui/Type';
import { useTheme } from '@/context/ThemeContext';
import { layout, radius } from '@/theme';
import { Tabs } from 'expo-router';
import { Platform, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const LABELS: Record<string, { label: string; mark: 'home' | 'gallery' | 'search' | 'saved' }> = {
  home: { label: 'Home', mark: 'home' },
  gallery: { label: 'Gallery', mark: 'gallery' },
  search: { label: 'Search', mark: 'search' },
  saved: { label: 'Saved', mark: 'saved' },
};

type TabBarProps = Parameters<NonNullable<React.ComponentProps<typeof Tabs>['tabBar']>>[0];

export function SpaceTabBar({ state, navigation }: TabBarProps) {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();

  return (
    <View style={[styles.wrap, { pointerEvents: 'box-none' }]}>
      <View
        style={[
          styles.bar,
          {
            marginBottom: Math.max(insets.bottom, 12),
            borderColor: colors.hairlineStrong,
            backgroundColor: colors.tabBar,
          },
        ]}
      >
        {state.routes.map((route, index) => {
          const meta = LABELS[route.name] ?? { label: route.name, mark: 'home' as const };
          const active = state.index === index;
          return (
            <Pressable
              key={route.key}
              accessibilityRole="button"
              accessibilityLabel={meta.label}
              onPress={() => {
                const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
                if (!active && !event.defaultPrevented) navigation.navigate(route.name);
              }}
              style={styles.item}
            >
              <Mark name={meta.mark} active={active} size={18} />
              <Type variant="micro" color={active ? colors.spark : colors.faint} style={{ marginTop: 5 }}>
                {meta.label}
              </Type>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
  },
  bar: {
    flexDirection: 'row',
    width: '100%',
    maxWidth: Platform.OS === 'web' ? layout.phone : undefined,
    marginHorizontal: 16,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: radius.xl,
    paddingVertical: 8,
    paddingHorizontal: 6,
  },
  item: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    minHeight: layout.tabBar - 24,
  },
});
