import { useTheme } from '@/context/ThemeContext';
import { fonts, radius } from '@/theme';
import { ReactNode } from 'react';
import { Pressable, StyleSheet, View, type PressableProps, type ViewStyle } from 'react-native';
import { Type } from './Type';

export function Hairline({ style }: { style?: ViewStyle }) {
  const { colors } = useTheme();
  return <View style={[styles.line, { backgroundColor: colors.hairline }, style]} />;
}

export function IconButton({
  children,
  label,
  onPress,
  active,
  style,
}: {
  children: ReactNode;
  label?: string;
  onPress?: PressableProps['onPress'];
  active?: boolean;
  style?: ViewStyle;
}) {
  const { colors } = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={({ pressed }) => [
        styles.iconBtn,
        { borderColor: colors.hairline, backgroundColor: colors.panel },
        active && { borderColor: colors.gold, backgroundColor: colors.goldDim },
        pressed && styles.pressed,
        style,
      ]}
    >
      {children}
      {label ? (
        <Type variant="micro" color={active ? colors.aurora : colors.faint} style={{ marginTop: 4 }}>
          {label}
        </Type>
      ) : null}
    </Pressable>
  );
}

export function Pill({ label, active, onPress }: { label: string; active?: boolean; onPress?: () => void }) {
  const { colors } = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={[
        styles.pill,
        { borderColor: colors.hairline, backgroundColor: colors.panel },
        active && { backgroundColor: colors.spark, borderColor: colors.spark },
      ]}
    >
      <Type variant="micro" color={active ? colors.onAccent : colors.muted}>
        {label}
      </Type>
    </Pressable>
  );
}

export function GlowButton({ label, onPress }: { label: string; onPress: () => void }) {
  const { colors } = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={({ pressed }) => [styles.glow, { backgroundColor: colors.spark }, pressed && styles.pressed]}
    >
      <Type variant="label" color={colors.onAccent} style={{ letterSpacing: 2, fontFamily: fonts.semibold }}>
        {label}
      </Type>
    </Pressable>
  );
}

export function Toast({ message }: { message: string }) {
  const { colors } = useTheme();
  return (
    <View style={[styles.toast, { borderColor: colors.aurora, backgroundColor: colors.auroraDim }]}>
      <Type variant="micro" color={colors.aurora}>
        {message}
      </Type>
    </View>
  );
}

const styles = StyleSheet.create({
  line: {
    height: StyleSheet.hairlineWidth,
    width: '100%',
  },
  iconBtn: {
    minWidth: 64,
    minHeight: 56,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: radius.md,
    paddingHorizontal: 8,
  },
  pressed: {
    opacity: 0.78,
  },
  pill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: radius.full,
  },
  glow: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 28,
    borderRadius: radius.full,
    boxShadow: '0 0 22px rgba(158, 197, 255, 0.45)',
  },
  toast: {
    marginTop: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: radius.sm,
    borderWidth: StyleSheet.hairlineWidth,
  },
});
