import { useTheme } from '@/context/ThemeContext';
import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';

type PlanetSpec = {
  name: string;
  radius: number;
  size: number;
  color: string;
  duration: number;
  ring?: boolean;
};

const PLANETS: PlanetSpec[] = [
  { name: 'mercury', radius: 42, size: 7, color: '#C9B8A4', duration: 8000 },
  { name: 'venus', radius: 62, size: 11, color: '#E8C07A', duration: 12000 },
  { name: 'earth', radius: 84, size: 13, color: '#6EA8FF', duration: 18000 },
  { name: 'mars', radius: 106, size: 10, color: '#E07A5F', duration: 24000 },
  { name: 'jupiter', radius: 128, size: 20, color: '#D4A574', duration: 34000 },
  { name: 'saturn', radius: 152, size: 16, color: '#E6D2A2', duration: 42000, ring: true },
];

function OrbitPlanet({ planet, phase }: { planet: PlanetSpec; phase: number }) {
  const progress = useSharedValue(phase);

  useEffect(() => {
    progress.value = withRepeat(withTiming(phase + 1, { duration: planet.duration, easing: Easing.linear }), -1, false);
  }, [phase, planet.duration, progress]);

  const style = useAnimatedStyle(() => {
    const angle = progress.value * Math.PI * 2;
    return {
      transform: [{ translateX: Math.cos(angle) * planet.radius }, { translateY: Math.sin(angle) * planet.radius }],
    };
  });

  return (
    <Animated.View style={[styles.planetWrap, { width: planet.size, height: planet.size, marginLeft: -planet.size / 2, marginTop: -planet.size / 2 }, style]}>
      {planet.ring ? <View style={[styles.ring, { width: planet.size * 2.1, height: planet.size * 0.55 }]} /> : null}
      <View style={[styles.planet, { width: planet.size, height: planet.size, backgroundColor: planet.color }]}>
        <View style={styles.glint} />
      </View>
    </Animated.View>
  );
}

export function PlanetScene() {
  const pulse = useSharedValue(0.92);
  const { colors } = useTheme();

  useEffect(() => {
    pulse.value = withRepeat(withTiming(1, { duration: 2200, easing: Easing.inOut(Easing.quad) }), -1, true);
  }, [pulse]);

  const sunStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulse.value }],
    opacity: 0.55 + pulse.value * 0.35,
  }));

  return (
    <View style={styles.stage}>
      {PLANETS.map((planet) => (
        <View
          key={`orbit-${planet.name}`}
          style={[
            styles.orbit,
            {
              width: planet.radius * 2,
              height: planet.radius * 2,
              borderRadius: planet.radius,
              borderColor: colors.hairline,
            },
          ]}
        />
      ))}
      <Animated.View style={[styles.sunGlow, sunStyle]} />
      <View style={[styles.sun, { backgroundColor: colors.gold }]} />
      {PLANETS.map((planet, index) => (
        <OrbitPlanet key={planet.name} planet={planet} phase={index * 0.13} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  stage: {
    height: 268,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  orbit: {
    position: 'absolute',
    borderWidth: StyleSheet.hairlineWidth,
  },
  sunGlow: {
    position: 'absolute',
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255, 215, 138, 0.28)',
  },
  sun: {
    width: 28,
    height: 28,
    borderRadius: 14,
    boxShadow: '0 0 16px rgba(255, 215, 138, 0.9)',
  },
  planetWrap: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  planet: {
    borderRadius: 99,
    overflow: 'hidden',
  },
  glint: {
    position: 'absolute',
    top: '18%',
    left: '18%',
    width: '34%',
    height: '34%',
    borderRadius: 99,
    backgroundColor: 'rgba(255,255,255,0.45)',
  },
  ring: {
    position: 'absolute',
    borderWidth: 1.5,
    borderColor: 'rgba(230, 210, 162, 0.7)',
    borderRadius: 99,
    transform: [{ rotate: '-24deg' }],
  },
});
