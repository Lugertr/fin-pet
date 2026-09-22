// src/components/lessons/LessonsBackground/LessonsBackground.web.tsx
// Веб-версия: без rive-react-native — пакет нативный (native modules для iOS/
// Android), его сборка для web не резолвится Metro (нет валидного web-байндинга
// для ./types в lib/module). Metro сам подхватывает .web.tsx вместо .tsx при
// сборке под web, поэтому здесь просто всегда рендерим градиентный фон —
// то же самое, на что и нативная версия сейчас падает (LESSONS_BACKGROUND_MODE
// = 'gradient', .riv-ассета ещё нет).

import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet } from 'react-native';

import { useTheme } from '@/theme';
import { colorPalettes } from '@/theme/tokens';

export const LESSONS_BACKGROUND_MODE: 'rive' | 'gradient' = 'gradient';
export const LESSONS_BACKGROUND_RIVE_URL = '';

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
