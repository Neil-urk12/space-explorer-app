import { SettingsButton } from '@/components/ui/SettingsButton';
import { StarField } from '@/components/ui/StarField';
import { useTheme } from '@/context/ThemeContext';
import { layout } from '@/theme';
import { LinearGradient } from 'expo-linear-gradient';
import { ReactNode } from 'react';
import { Platform, ScrollView, StyleSheet, View, type ScrollViewProps, type ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type ScreenProps = {
  children: ReactNode;
  scroll?: boolean;
  padded?: boolean;
  tabInset?: boolean;
  settings?: boolean;
  hasSky?: boolean;
  refreshControl?: ScrollViewProps['refreshControl'];
  contentContainerStyle?: ScrollViewProps['contentContainerStyle'];
  style?: ViewStyle;
};

export function SkyBackground() {
  const { colors } = useTheme();

  return (
    <View pointerEvents="none" style={[styles.sky, { backgroundColor: colors.void }]}>
      <LinearGradient colors={[colors.sky[0], colors.sky[1], colors.sky[2]]} style={StyleSheet.absoluteFill} />
      <View style={[styles.nebulaA, { backgroundColor: colors.nebulaA }]} />
      <View style={[styles.nebulaB, { backgroundColor: colors.nebulaB }]} />
      <StarField />
    </View>
  );
}

export function Screen({
  children,
  scroll = false,
  padded = true,
  tabInset = true,
  settings = true,
  hasSky = true,
  refreshControl,
  contentContainerStyle,
  style,
}: ScreenProps) {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const bottomGap = (tabInset ? layout.tabBar + 22 : 16) + insets.bottom;
  const padding = {
    paddingHorizontal: padded ? 20 : 0,
    paddingTop: Math.max(insets.top, 12),
    paddingBottom: bottomGap,
  };

  return (
    <View style={[styles.root, { backgroundColor: hasSky ? colors.void : 'transparent' }]}>
      {hasSky ? <SkyBackground /> : null}
      <View style={[styles.frame, style]}>
        {scroll ? (
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={[padding, contentContainerStyle]}
            refreshControl={refreshControl}
          >
            {children}
          </ScrollView>
        ) : (
          <View style={[styles.fill, padding, contentContainerStyle as ViewStyle]}>{children}</View>
        )}
      </View>
      {settings ? <SettingsButton /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    alignItems: 'center',
  },
  sky: {
    ...StyleSheet.absoluteFill,
    overflow: 'hidden',
  },
  nebulaA: {
    position: 'absolute',
    width: 280,
    height: 280,
    borderRadius: 140,
    top: -40,
    right: -60,
  },
  nebulaB: {
    position: 'absolute',
    width: 240,
    height: 240,
    borderRadius: 120,
    bottom: 80,
    left: -80,
  },
  frame: {
    flex: 1,
    width: '100%',
    maxWidth: Platform.OS === 'web' ? layout.phone : undefined,
  },
  fill: {
    flex: 1,
  },
});
