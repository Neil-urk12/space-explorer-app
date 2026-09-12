import { Mark } from '@/components/ui/Marks';
import { Type } from '@/components/ui/Type';
import { useTheme } from '@/context/ThemeContext';
import { radius } from '@/theme';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export function SettingsButton() {
  const insets = useSafeAreaInsets();
  const { mode, colors, setMode } = useTheme();
  const [open, setOpen] = useState(false);

  return (
    <>
      {open ? <Pressable style={styles.dismiss} onPress={() => setOpen(false)} accessibilityLabel="Close settings" /> : null}
      <View style={[styles.anchor, { top: Math.max(insets.top, 8), right: 16 }]} pointerEvents="box-none">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Settings"
          onPress={() => setOpen((current) => !current)}
          style={({ pressed }) => [
            styles.gear,
            { borderColor: colors.hairline, backgroundColor: colors.panel },
            pressed && { opacity: 0.78 },
          ]}
        >
          <Mark name="gear" size={18} />
        </Pressable>

        {open ? (
          <View style={[styles.sheet, { borderColor: colors.hairlineStrong, backgroundColor: colors.panelSolid }]}>
            <Type variant="micro" color={colors.gold}>
              Settings
            </Type>
            <Type variant="title" style={{ marginTop: 8 }}>
              Appearance
            </Type>
            <View style={styles.row}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Dark mode"
                onPress={() => setMode('dark')}
                style={[
                  styles.choice,
                  { borderColor: colors.hairline, backgroundColor: colors.panel },
                  mode === 'dark' && { backgroundColor: colors.spark, borderColor: colors.spark },
                ]}
              >
                <Mark name="moon" active={mode === 'dark'} size={16} />
                <Type variant="micro" color={mode === 'dark' ? colors.onAccent : colors.muted} style={{ marginTop: 6 }}>
                  Dark
                </Type>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Light mode"
                onPress={() => setMode('light')}
                style={[
                  styles.choice,
                  { borderColor: colors.hairline, backgroundColor: colors.panel },
                  mode === 'light' && { backgroundColor: colors.spark, borderColor: colors.spark },
                ]}
              >
                <Mark name="sun" active={mode === 'light'} size={16} />
                <Type variant="micro" color={mode === 'light' ? colors.onAccent : colors.muted} style={{ marginTop: 6 }}>
                  Light
                </Type>
              </Pressable>
            </View>
          </View>
        ) : null}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  dismiss: {
    ...StyleSheet.absoluteFill,
    zIndex: 28,
  },
  anchor: {
    position: 'absolute',
    zIndex: 30,
    alignItems: 'flex-end',
  },
  gear: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sheet: {
    marginTop: 8,
    width: 220,
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 16,
  },
  row: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 14,
  },
  choice: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: radius.md,
    borderWidth: StyleSheet.hairlineWidth,
  },
});
