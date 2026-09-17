import { useTheme } from '@/context/ThemeContext';
import type { Palette } from '@/theme';
import { useIsFocused } from 'expo-router';
import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { cancelAnimation, Easing, useAnimatedStyle, useSharedValue, withDelay, withRepeat, withTiming } from 'react-native-reanimated';

type Star = { left: number; top: number; size: number; delay: number; duration: number; sparkle: boolean; animated: boolean };
type StarColors = Pick<Palette, 'spark' | 'starDot'>;

function buildStars(count: number): Star[] {
  const stars: Star[] = [];
  let seed = 17;
  for (let i = 0; i < count; i += 1) {
    seed = (seed * 16807) % 2147483647;
    stars.push({
      left: seed % 100,
      top: Math.floor(seed / 37) % 100,
      size: (seed % 3) + 1,
      delay: seed % 2400,
      duration: 1400 + (seed % 1800),
      sparkle: seed % 9 === 0,
      animated: i % 6 === 0,
    });
  }
  return stars;
}

const STARS = buildStars(48);

function StarContent({ star, colors }: { star: Star; colors: StarColors }) {
  if (!star.sparkle) return null;

  return (
    <>
      <View style={[styles.sparkArm, { width: star.size + 4, height: 1, backgroundColor: colors.spark }]} />
      <View style={[styles.sparkArm, { width: 1, height: star.size + 4, backgroundColor: colors.spark }]} />
      <View style={[styles.sparkCore, { backgroundColor: colors.starDot }]} />
    </>
  );
}

function StaticStar({ star, colors }: { star: Star; colors: StarColors }) {
  if (star.sparkle) {
    return (
      <View
        style={[
          styles.sparkle,
          {
            left: `${star.left}%`,
            top: `${star.top}%`,
            width: star.size + 4,
            height: star.size + 4,
            opacity: 0.25,
          },
        ]}
      >
        <StarContent star={star} colors={colors} />
      </View>
    );
  }

  return (
    <View
      style={[
        styles.star,
        {
          left: `${star.left}%`,
          top: `${star.top}%`,
          width: star.size,
          height: star.size,
          opacity: 0.35,
          backgroundColor: colors.starDot,
        },
      ]}
    />
  );
}

function AnimatedStar({ star, colors }: { star: Star; colors: StarColors }) {
  const opacity = useSharedValue(star.sparkle ? 0.25 : 0.35);

  useEffect(() => {
    opacity.value = withDelay(
      star.delay,
      withRepeat(withTiming(star.sparkle ? 1 : 0.85, { duration: star.duration, easing: Easing.inOut(Easing.quad) }), -1, true),
    );

    return () => cancelAnimation(opacity);
  }, [opacity, star]);

  const style = useAnimatedStyle(() => ({ opacity: opacity.value }));

  if (star.sparkle) {
    return (
      <Animated.View
        style={[
          styles.sparkle,
          style,
          { left: `${star.left}%`, top: `${star.top}%`, width: star.size + 4, height: star.size + 4 },
        ]}
      >
        <StarContent star={star} colors={colors} />
      </Animated.View>
    );
  }

  return (
    <Animated.View
      style={[
        styles.star,
        style,
        {
          left: `${star.left}%`,
          top: `${star.top}%`,
          width: star.size,
          height: star.size,
          backgroundColor: colors.starDot,
        },
      ]}
    />
  );
}

export function StarField() {
  const { colors } = useTheme();
  const focused = useIsFocused();

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      {STARS.map((star, index) => (
        focused && star.animated ? <AnimatedStar key={index} star={star} colors={colors} /> : <StaticStar key={index} star={star} colors={colors} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  star: {
    position: 'absolute',
    borderRadius: 99,
  },
  sparkle: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sparkArm: {
    position: 'absolute',
    borderRadius: 99,
  },
  sparkCore: {
    width: 2,
    height: 2,
    borderRadius: 99,
  },
});
