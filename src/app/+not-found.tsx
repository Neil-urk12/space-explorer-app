import { Screen } from '@/components/ui/Screen';
import { Type } from '@/components/ui/Type';
import { useTheme } from '@/context/ThemeContext';
import { Link } from 'expo-router';
import { View } from 'react-native';

export default function NotFound() {
  const { colors } = useTheme();
  return (
    <Screen tabInset={false}>
      <View style={{ paddingRight: 36 }}>
        <Type variant="micro" color={colors.gold}>
          Off-course
        </Type>
        <Type variant="headline" style={{ marginTop: 12 }}>
          This coordinate is empty.
        </Type>
      </View>
      <Link href="/" style={{ marginTop: 18 }}>
        <Type variant="label" color={colors.spark}>
          Return to Space Explorer
        </Type>
      </Link>
    </Screen>
  );
}
