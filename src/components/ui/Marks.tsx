import { useTheme } from '@/context/ThemeContext';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { Image } from 'expo-image';
import { SymbolView, type AndroidSymbol, type SFSymbol } from 'expo-symbols';
import light from 'expo-symbols/androidWeights/light';
import { Platform } from 'react-native';

type MarkName =
  | 'home'
  | 'gallery'
  | 'search'
  | 'saved'
  | 'share'
  | 'save'
  | 'back'
  | 'heart'
  | 'heartFill'
  | 'play'
  | 'gear'
  | 'sun'
  | 'moon';

const ICONS: Record<MarkName, { ios: SFSymbol; web: AndroidSymbol }> = {
  home: { ios: 'house', web: 'home' },
  gallery: { ios: 'square.grid.2x2', web: 'grid_view' },
  search: { ios: 'magnifyingglass', web: 'search' },
  saved: { ios: 'heart', web: 'favorite_border' },
  share: { ios: 'square.and.arrow.up', web: 'ios_share' },
  save: { ios: 'arrow.down.to.line', web: 'download' },
  back: { ios: 'chevron.left', web: 'chevron_left' },
  heart: { ios: 'heart', web: 'favorite_border' },
  heartFill: { ios: 'heart.fill', web: 'favorite' },
  play: { ios: 'play.fill', web: 'play_arrow' },
  gear: { ios: 'gearshape', web: 'settings' },
  sun: { ios: 'sun.max', web: 'light_mode' },
  moon: { ios: 'moon', web: 'dark_mode' },
};

const HEART =
  'M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z';

const FILLED: Partial<Record<MarkName, string>> = {
  home: 'M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z',
  gallery: 'M3 3h8v8H3V3zm10 0h8v8h-8V3zM3 13h8v8H3v-8zm10 0h8v8h-8v-8z',
  search:
    'M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z',
  saved: HEART,
  heartFill: HEART,
};

const HEART_RED = '#E10600';

const GLYPHS: Partial<Record<MarkName, { idle: 'home-outline' | 'view-grid-outline' | 'magnify' | 'heart-outline'; on: 'home' | 'view-grid' | 'magnify' | 'heart' }>> = {
  home: { idle: 'home-outline', on: 'home' },
  gallery: { idle: 'view-grid-outline', on: 'view-grid' },
  search: { idle: 'magnify', on: 'magnify' },
  saved: { idle: 'heart-outline', on: 'heart' },
  heart: { idle: 'heart-outline', on: 'heart' },
  heartFill: { idle: 'heart', on: 'heart' },
};

function filledSvg(path: string, color: string) {
  const xml = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="${color}" d="${path}"/></svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(xml)}`;
}

export function Mark({ name, active = false, size = 18 }: { name: MarkName; active?: boolean; size?: number }) {
  const { colors } = useTheme();
  const solid = name === 'heartFill' || (active && FILLED[name]);
  const path = FILLED[name];

  const tint = name === 'heartFill' ? HEART_RED : colors.star;

  const glyph = GLYPHS[name];
  if (glyph && (Platform.OS !== 'web' || solid)) {
    return <MaterialCommunityIcons name={solid ? glyph.on : glyph.idle} size={size} color={tint} />;
  }

  if (Platform.OS === 'web' && solid && path) {
    return (
      <Image
        source={{ uri: filledSvg(path, tint) }}
        style={{ width: size, height: size }}
        contentFit="contain"
        accessibilityElementsHidden
      />
    );
  }

  const icon = ICONS[name];
  return (
    <SymbolView
      name={{ ios: icon.ios, android: icon.web, web: icon.web }}
      size={size}
      tintColor={tint}
      weight={{ ios: 'light', android: light }}
      style={{ width: size, height: size }}
    />
  );
}
