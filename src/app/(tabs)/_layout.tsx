import { SpaceTabBar } from '@/components/navigation/TabBar';
import { SkyBackground } from '@/components/ui/Screen';
import { useTheme } from '@/context/ThemeContext';
import { Tabs } from 'expo-router';
import { StyleSheet, View } from 'react-native';

export default function TabsLayout() {
  const { colors } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.void }]}>
      <SkyBackground />
      <Tabs
        tabBar={(props) => <SpaceTabBar {...props} />}
        screenOptions={{
          headerShown: false,
          sceneStyle: { backgroundColor: 'transparent' },
        }}
      >
        <Tabs.Screen name="home" options={{ title: 'Home' }} />
        <Tabs.Screen name="gallery" options={{ title: 'Gallery' }} />
        <Tabs.Screen name="search" options={{ title: 'Search' }} />
        <Tabs.Screen name="saved" options={{ title: 'Saved' }} />
      </Tabs>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
