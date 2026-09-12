import { useTheme } from '@/context/ThemeContext';
import { StyleSheet, View } from 'react-native';

type MarkName =
  | 'home'
  | 'gallery'
  | 'search'
  | 'saved'
  | 'share'
  | 'save'
  | 'back'
  | 'heart'
  | 'heartFill'
  | 'play'
  | 'gear'
  | 'sun'
  | 'moon';

export function Mark({ name, active = false, size = 18 }: { name: MarkName; active?: boolean; size?: number }) {
  const { colors } = useTheme();
  const color = active ? colors.spark : colors.star;
  const stroke = Math.max(1.2, size / 14);

  if (name === 'home') {
    return (
      <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
        <View style={[styles.circle, { width: size * 0.72, height: size * 0.72, borderColor: color, borderWidth: stroke }]} />
        <View style={[styles.dot, { backgroundColor: color, width: size * 0.18, height: size * 0.18 }]} />
      </View>
    );
  }

  if (name === 'gallery') {
    return (
      <View style={{ width: size, height: size, flexDirection: 'row', flexWrap: 'wrap', gap: size * 0.14, padding: size * 0.08 }}>
        {[0, 1, 2, 3].map((key) => (
          <View key={key} style={{ width: size * 0.28, height: size * 0.28, borderWidth: stroke, borderColor: color, borderRadius: 2 }} />
        ))}
      </View>
    );
  }

  if (name === 'search') {
    return (
      <View style={{ width: size, height: size }}>
        <View style={{ width: size * 0.62, height: size * 0.62, borderRadius: 99, borderWidth: stroke, borderColor: color }} />
        <View
          style={{
            position: 'absolute',
            right: 0,
            bottom: 1,
            width: size * 0.42,
            height: stroke + 0.5,
            backgroundColor: color,
            transform: [{ rotate: '42deg' }],
          }}
        />
      </View>
    );
  }

  if (name === 'saved' || name === 'heart' || name === 'heartFill') {
    const filled = name === 'heartFill' || (name === 'saved' && active);
    return (
      <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
        <View
          style={{
            width: size * 0.58,
            height: size * 0.58,
            borderWidth: stroke,
            borderColor: filled ? colors.gold : color,
            backgroundColor: filled ? colors.gold : 'transparent',
            transform: [{ rotate: '45deg' }],
            borderRadius: 2,
          }}
        />
      </View>
    );
  }

  if (name === 'share') {
    return (
      <View style={{ width: size, height: size, alignItems: 'center' }}>
        <View style={{ width: stroke + 0.4, height: size * 0.55, backgroundColor: color, marginTop: 1 }} />
        <View
          style={{
            position: 'absolute',
            top: 1,
            width: size * 0.42,
            height: size * 0.42,
            borderLeftWidth: stroke,
            borderTopWidth: stroke,
            borderColor: color,
            transform: [{ rotate: '45deg' }],
          }}
        />
        <View style={{ width: size * 0.7, height: size * 0.28, borderWidth: stroke, borderTopWidth: 0, borderColor: color, marginTop: 2 }} />
      </View>
    );
  }

  if (name === 'save') {
    return (
      <View style={{ width: size, height: size, alignItems: 'center' }}>
        <View style={{ width: stroke + 0.4, height: size * 0.52, backgroundColor: color }} />
        <View
          style={{
            position: 'absolute',
            bottom: size * 0.22,
            width: size * 0.42,
            height: size * 0.42,
            borderLeftWidth: stroke,
            borderBottomWidth: stroke,
            borderColor: color,
            transform: [{ rotate: '-45deg' }],
          }}
        />
        <View style={{ width: size * 0.72, height: stroke + 0.4, backgroundColor: color, marginTop: 4 }} />
      </View>
    );
  }

  if (name === 'gear') {
    return (
      <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
        <View style={{ width: size * 0.42, height: size * 0.42, borderRadius: 99, borderWidth: stroke, borderColor: color }} />
        {[0, 45, 90, 135].map((deg) => (
          <View
            key={deg}
            style={{
              position: 'absolute',
              width: stroke + 0.4,
              height: size,
              backgroundColor: color,
              transform: [{ rotate: `${deg}deg` }],
              opacity: 0.9,
            }}
          />
        ))}
        <View style={{ position: 'absolute', width: size * 0.28, height: size * 0.28, borderRadius: 99, backgroundColor: 'transparent' }} />
      </View>
    );
  }

  if (name === 'sun') {
    return (
      <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
        {[0, 45, 90, 135].map((deg) => (
          <View
            key={deg}
            style={{
              position: 'absolute',
              width: stroke,
              height: size,
              backgroundColor: color,
              transform: [{ rotate: `${deg}deg` }],
              opacity: 0.7,
            }}
          />
        ))}
        <View style={{ width: size * 0.42, height: size * 0.42, borderRadius: 99, backgroundColor: color }} />
      </View>
    );
  }

  if (name === 'moon') {
    return (
      <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
        <View style={{ width: size * 0.72, height: size * 0.72, borderRadius: 99, backgroundColor: color }} />
        <View
          style={{
            position: 'absolute',
            right: size * 0.08,
            top: size * 0.1,
            width: size * 0.5,
            height: size * 0.5,
            borderRadius: 99,
            backgroundColor: colors.void,
          }}
        />
      </View>
    );
  }

  if (name === 'back') {
    return (
      <View style={{ width: size, height: size, justifyContent: 'center' }}>
        <View
          style={{
            width: size * 0.48,
            height: size * 0.48,
            borderLeftWidth: stroke,
            borderBottomWidth: stroke,
            borderColor: color,
            transform: [{ rotate: '45deg' }],
            marginLeft: size * 0.28,
          }}
        />
      </View>
    );
  }

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <View
        style={{
          width: 0,
          height: 0,
          borderLeftWidth: size * 0.22,
          borderRightWidth: 0,
          borderTopWidth: size * 0.16,
          borderBottomWidth: size * 0.16,
          borderLeftColor: color,
          borderTopColor: 'transparent',
          borderBottomColor: 'transparent',
          marginLeft: 3,
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  circle: {
    borderRadius: 99,
    position: 'absolute',
  },
  dot: {
    borderRadius: 99,
  },
});
