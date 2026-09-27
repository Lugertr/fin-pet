// src/components/lessons/LessonsBackground/LessonsBackground.tsx
// Фон вкладки уроков — вертикальный градиент по теме (светлая/тёмная).

import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet } from 'react-native';

import { useTheme } from '@/theme';
import { colorPalettes } from '@/theme/tokens';

export function LessonsBackground() {
  const { isDark } = useTheme();

  const gradient: [string, string] = isDark
    ? [colorPalettes.slate[900], colorPalettes.indigo[950]]
    : [colorPalettes.slate[50], colorPalettes.indigo[50]];

  return (
    <LinearGradient
      colors={gradient}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
      style={StyleSheet.absoluteFill}
    />
  );
}
