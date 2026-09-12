import { useTheme } from '@/context/ThemeContext';
import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withDelay, withRepeat, withTiming } from 'react-native-reanimated';

type Star = { left: number; top: number; size: number; delay: number; duration: number; sparkle: boolean };

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
    });
  }
  return stars;
}

const STARS = buildStars(110);

function Twinkle({ star }: { star: Star }) {
  const { colors } = useTheme();
  const opacity = useSharedValue(star.sparkle ? 0.25 : 0.35);

  useEffect(() => {
    opacity.value = withDelay(
      star.delay,
      withRepeat(withTiming(star.sparkle ? 1 : 0.85, { duration: star.duration, easing: Easing.inOut(Easing.quad) }), -1, true),
    );
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
        <View style={[styles.sparkArm, { width: star.size + 4, height: 1, backgroundColor: colors.spark }]} />
        <View style={[styles.sparkArm, { width: 1, height: star.size + 4, backgroundColor: colors.spark }]} />
        <View style={[styles.sparkCore, { backgroundColor: colors.starDot }]} />
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
  return (
    <View style={[StyleSheet.absoluteFill, { pointerEvents: 'none' }]}>
      {STARS.map((star, index) => (
        <Twinkle key={index} star={star} />
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
