import { GlowButton } from '@/components/ui/Chrome';
import { Screen } from '@/components/ui/Screen';
import { Type } from '@/components/ui/Type';
import { PlanetScene } from '@/components/welcome/PlanetScene';
import { useTheme } from '@/context/ThemeContext';
import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';

export default function WelcomeScreen() {
  const { colors } = useTheme();

  return (
    <Screen tabInset={false}>
      <View style={styles.col}>
        <Animated.View entering={FadeInDown.duration(900)} style={{ marginBottom: 16 }}>
          <PlanetScene />
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(220).duration(700)} style={styles.copy}>
          <Type variant="micro" color={colors.gold}>
            NASA · APOD Archive
          </Type>
          <Type variant="display" style={{ marginTop: 10 }}>
            Space
          </Type>
          <Type variant="display">Explorer</Type>
          <Type variant="body" style={styles.intro}>
            Drift through Astronomy Pictures of the Day — galaxies, nebulae, and nearby worlds — then keep the nights you want to see again.
          </Type>
          <View style={{ marginTop: 22 }}>
            <GlowButton label="Explore More" onPress={() => router.replace('/home')} />
          </View>
        </Animated.View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  col: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  copy: {
    paddingBottom: 20,
  },
  intro: {
    marginTop: 12,
    maxWidth: 340,
    fontSize: 15,
    lineHeight: 24,
  },
});
