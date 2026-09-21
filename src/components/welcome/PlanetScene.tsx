import { PlanetRenderer } from '@/components/welcome/planetRenderer';
import { useTheme } from '@/context/ThemeContext';
import { GLView, type ExpoWebGLRenderingContext } from 'expo-gl';
import { useIsFocused } from 'expo-router';
import { useCallback, useEffect, useRef } from 'react';
import { StyleSheet, View, useWindowDimensions } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

/**
 * Full-bleed hero for the welcome screen: one WebGL-rendered Earth lit by a
 * single directional sun, with a drifting cloud layer, night-side city lights
 * and an atmospheric rim glow. See `planetRenderer` for the three.js scene.
 *
 * Decorative only — the copy stacked above it carries the meaning.
 */
export function PlanetScene() {
  const { colors } = useTheme();
  const { width, height } = useWindowDimensions();
  const reducedMotion = useReducedMotion();
  const focused = useIsFocused();

  const rendererRef = useRef<PlanetRenderer | null>(null);
  const colorsRef = useRef(colors);
  const reducedRef = useRef(Boolean(reducedMotion));
  const focusedRef = useRef(focused);
  const loadedRef = useRef(false);

  useEffect(() => {
    colorsRef.current = colors;
    reducedRef.current = Boolean(reducedMotion);
    focusedRef.current = focused;
  });

  // The GL surface cannot cross-fade on Android, so the scene is revealed by
  // fading a themed veil off it instead of animating the surface itself.
  const veil = useSharedValue(1);
  const veilStyle = useAnimatedStyle(() => ({ opacity: veil.value }));

  useEffect(() => {
    if (reducedMotion && loadedRef.current) veil.value = 0;
  }, [reducedMotion, veil]);

  const onContextCreate = useCallback((gl: ExpoWebGLRenderingContext) => {
    if (typeof WebGL2RenderingContext === 'undefined' || !(gl instanceof WebGL2RenderingContext)) return;

    let renderer: PlanetRenderer | null = null;
    try {
      renderer = new PlanetRenderer(gl, colorsRef.current, reducedRef.current);
      rendererRef.current = renderer;
      loadedRef.current = false;
      veil.value = 1;
      renderer.setPaused(!focusedRef.current);
      renderer
        .loadPlanet()
        .then(() => {
          if (rendererRef.current !== renderer) return;
          loadedRef.current = true;
          veil.value = reducedRef.current ? 0 : withTiming(0, { duration: 1100, easing: Easing.out(Easing.quad) });
        })
        .catch(() => {
          // Keep the themed veil visible when a texture fails to load.
        });
    } catch {
      rendererRef.current = null;
      loadedRef.current = false;
      renderer?.dispose();
    }
  }, [veil]);

  useEffect(() => {
    const renderer = rendererRef.current;
    if (!renderer) return;
    renderer.setReduced(Boolean(reducedMotion));
    renderer.setPaused(!focused);
  }, [focused, reducedMotion]);

  useEffect(() => {
    rendererRef.current?.applyTheme(colors);
  }, [colors]);

  useEffect(() => {
    rendererRef.current?.requestFrame();
  }, [width, height]);

  useEffect(
    () => () => {
      const renderer = rendererRef.current;
      rendererRef.current = null;
      loadedRef.current = false;
      renderer?.dispose();
    },
    [],
  );

  return (
    <View
      accessible={false}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      pointerEvents="none"
      style={StyleSheet.absoluteFill}
    >
      <GLView onContextCreate={onContextCreate} style={StyleSheet.absoluteFill} />
      <Animated.View style={[StyleSheet.absoluteFill, veilStyle, { backgroundColor: colors.void }]} />
    </View>
  );
}
