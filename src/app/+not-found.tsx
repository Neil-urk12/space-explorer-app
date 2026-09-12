import { Screen } from '@/components/ui/Screen';
import { Type } from '@/components/ui/Type';
import { useTheme } from '@/context/ThemeContext';
import { Link } from 'expo-router';

export default function NotFound() {
  const { colors } = useTheme();
  return (
    <Screen tabInset={false}>
      <Type variant="micro" color={colors.gold}>
        Off-course
      </Type>
      <Type variant="headline" style={{ marginTop: 12 }}>
        This coordinate is empty.
      </Type>
      <Link href="/" style={{ marginTop: 18 }}>
        <Type variant="label" color={colors.spark}>
          Return to Space Explorer
        </Type>
      </Link>
    </Screen>
  );
}
