import { useTheme } from '@/context/ThemeContext';
import { fonts } from '@/theme';
import { Text, type TextProps, type TextStyle } from 'react-native';

type Variant = 'display' | 'headline' | 'title' | 'body' | 'label' | 'micro' | 'numeric';

const base: Record<Variant, TextStyle> = {
  display: {
    fontFamily: fonts.bold,
    fontSize: 48,
    lineHeight: 50,
    letterSpacing: -1.6,
  },
  headline: {
    fontFamily: fonts.semibold,
    fontSize: 30,
    lineHeight: 34,
    letterSpacing: -0.5,
  },
  title: {
    fontFamily: fonts.medium,
    fontSize: 17,
    lineHeight: 23,
    letterSpacing: -0.2,
  },
  body: {
    fontFamily: fonts.regular,
    fontSize: 14,
    lineHeight: 22,
  },
  label: {
    fontFamily: fonts.medium,
    fontSize: 11,
    lineHeight: 14,
    letterSpacing: 2.4,
    textTransform: 'uppercase',
  },
  micro: {
    fontFamily: fonts.medium,
    fontSize: 10,
    lineHeight: 13,
    letterSpacing: 2.8,
    textTransform: 'uppercase',
  },
  numeric: {
    fontFamily: fonts.medium,
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 1.4,
  },
};

type TypeProps = TextProps & {
  variant?: Variant;
  color?: string;
};

export function Type({ variant = 'body', color, style, ...rest }: TypeProps) {
  const { colors } = useTheme();
  const fallback =
    variant === 'body' || variant === 'label' ? colors.muted : variant === 'micro' ? colors.faint : colors.star;

  return <Text {...rest} style={[base[variant], { color: color ?? fallback }, style]} />;
}
