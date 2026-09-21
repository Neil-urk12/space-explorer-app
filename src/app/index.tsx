import { GlowButton } from '@/components/ui/Chrome';
import { Screen } from '@/components/ui/Screen';
import { Type } from '@/components/ui/Type';
import { PlanetScene } from '@/components/welcome/PlanetScene';
import { useTheme } from '@/context/ThemeContext';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';

export default function WelcomeScreen() {
  const { colors } = useTheme();

  return (
    <Screen tabInset={false} padded={false} hasSky={false}>
      <View pointerEvents="none" style={StyleSheet.absoluteFill}>
        <PlanetScene />
      </View>

      <LinearGradient
        pointerEvents="none"
        colors={colors.scrim}
        locations={[0.34, 0.68, 1]}
        style={StyleSheet.absoluteFill}
      />

      <Animated.View entering={FadeInUp.delay(260).duration(700)} style={styles.copy}>
        <Type variant="micro" color={colors.gold}>
          NASA · APOD Archive
        </Type>
        <Type variant="display" style={styles.headline}>
          Space
        </Type>
        <Type variant="display">Explorer</Type>
        <Type variant="body" style={styles.intro}>
          Drift through Astronomy Pictures of the Day — galaxies, nebulae, and nearby worlds — then keep the nights you want to see again.
        </Type>
        <View style={styles.cta}>
          <GlowButton label="Explore More" onPress={() => router.replace('/home')} />
        </View>
      </Animated.View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  copy: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingHorizontal: 24,
    paddingBottom: 20,
  },
  headline: {
    marginTop: 10,
  },
  intro: {
    marginTop: 12,
    maxWidth: 340,
    fontSize: 15,
    lineHeight: 24,
  },
  cta: {
    marginTop: 22,
  },
});
