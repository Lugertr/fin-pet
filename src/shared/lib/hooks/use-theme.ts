import { Colors } from '@/shared/config/theme';
import { useColorScheme } from '@/shared/lib/hooks/use-color-scheme';

export function useTheme() {
  const scheme = useColorScheme();
  const theme = scheme === 'unspecified' ? 'light' : scheme;

  return Colors[theme];
}
