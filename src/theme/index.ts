export type ThemeMode = 'dark' | 'light';

export type Palette = {
  void: string;
  deep: string;
  ink: string;
  panel: string;
  panelSolid: string;
  panelHot: string;
  hairline: string;
  hairlineStrong: string;
  star: string;
  muted: string;
  faint: string;
  spark: string;
  sparkDim: string;
  nebula: string;
  nebulaDim: string;
  aurora: string;
  auroraDim: string;
  gold: string;
  goldDim: string;
  danger: string;
  onAccent: string;
  tabBar: string;
  sky: readonly [string, string, string];
  nebulaA: string;
  nebulaB: string;
  starDot: string;
};

export const palettes: Record<ThemeMode, Palette> = {
  dark: {
    void: '#000000',
    deep: '#05070F',
    ink: '#080B16',
    panel: 'rgba(10, 14, 28, 0.78)',
    panelSolid: '#0C1020',
    panelHot: '#12182C',
    hairline: 'rgba(186, 210, 255, 0.16)',
    hairlineStrong: 'rgba(210, 226, 255, 0.34)',
    star: '#F4F7FF',
    muted: 'rgba(214, 224, 255, 0.64)',
    faint: 'rgba(214, 224, 255, 0.34)',
    spark: '#9EC5FF',
    sparkDim: 'rgba(158, 197, 255, 0.16)',
    nebula: '#8B7CFF',
    nebulaDim: 'rgba(139, 124, 255, 0.18)',
    aurora: '#7DFFC4',
    auroraDim: 'rgba(125, 255, 196, 0.14)',
    gold: '#FFD78A',
    goldDim: 'rgba(255, 215, 138, 0.16)',
    danger: '#FF8A8A',
    onAccent: '#05070F',
    tabBar: 'rgba(6, 8, 18, 0.92)',
    sky: ['#000000', '#050814', '#000010'],
    nebulaA: 'rgba(88, 70, 180, 0.22)',
    nebulaB: 'rgba(40, 90, 170, 0.18)',
    starDot: '#F4F7FF',
  },
  light: {
    void: '#F3F6FC',
    deep: '#E8EEF8',
    ink: '#DDE6F4',
    panel: 'rgba(255, 255, 255, 0.82)',
    panelSolid: '#FFFFFF',
    panelHot: '#E4EAF6',
    hairline: 'rgba(28, 40, 72, 0.14)',
    hairlineStrong: 'rgba(28, 40, 72, 0.28)',
    star: '#141A28',
    muted: 'rgba(20, 26, 40, 0.64)',
    faint: 'rgba(20, 26, 40, 0.4)',
    spark: '#3D6FD9',
    sparkDim: 'rgba(61, 111, 217, 0.14)',
    nebula: '#6B5CDB',
    nebulaDim: 'rgba(107, 92, 219, 0.12)',
    aurora: '#1F9A6B',
    auroraDim: 'rgba(31, 154, 107, 0.12)',
    gold: '#B7791F',
    goldDim: 'rgba(183, 121, 31, 0.14)',
    danger: '#C94A4A',
    onAccent: '#FFFFFF',
    tabBar: 'rgba(255, 255, 255, 0.9)',
    sky: ['#F7F9FD', '#E7EEF8', '#D5E3F6'],
    nebulaA: 'rgba(150, 130, 220, 0.2)',
    nebulaB: 'rgba(110, 160, 220, 0.18)',
    starDot: 'rgba(20, 26, 40, 0.35)',
  },
};

export const colors = palettes.dark;

export const fonts = {
  light: 'SpaceGrotesk_300Light',
  regular: 'SpaceGrotesk_400Regular',
  medium: 'SpaceGrotesk_500Medium',
  semibold: 'SpaceGrotesk_600SemiBold',
  bold: 'SpaceGrotesk_700Bold',
} as const;

export const space = {
  xs: 6,
  sm: 10,
  md: 16,
  lg: 24,
  xl: 36,
  xxl: 56,
} as const;

export const radius = {
  sm: 10,
  md: 16,
  lg: 22,
  xl: 28,
  full: 999,
} as const;

export const layout = {
  phone: 440,
  tabBar: 72,
} as const;
