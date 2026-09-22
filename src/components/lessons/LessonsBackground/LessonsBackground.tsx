// src/components/lessons/LessonsBackground/LessonsBackground.tsx
// Фон вкладки уроков: простой градиент или Rive-анимация — тот же
// приём, что PET_RENDER_MODE в constants/petAssets.ts (режим + доступность
// конкретного ассета решают, что рендерить, с безусловным fallback).
//
// Ассет .riv пока не существует (assets/animations/ пуст, а .riv — бинарный
// формат редактора Rive, сгенерировать его нельзя). Поэтому здесь НЕТ
// require() локального .riv-файла — Metro резолвит require() статически на
// этапе сборки независимо от рантайм-условий, и require() несуществующего
// файла сломал бы весь билд, а не просто откатился на фон в рантайме.
// Вместо этого — загрузка по URL (LESSONS_BACKGROUND_RIVE_URL): когда
// появится хостинг для .riv-файла, достаточно проставить сюда ссылку и
// включить LESSONS_BACKGROUND_MODE = 'rive'; при ошибке загрузки (onError)
// компонент сам откатится на градиент.

import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import { StyleSheet } from 'react-native';
import Rive, { Fit } from 'rive-react-native';

import { useTheme } from '@/theme';
import { colorPalettes } from '@/theme/tokens';

export const LESSONS_BACKGROUND_MODE: 'rive' | 'gradient' = 'gradient';
/** Ссылка на .riv-файл фона — пусто, пока ассет не готов. */
export const LESSONS_BACKGROUND_RIVE_URL = '';

export function LessonsBackground() {
  const { isDark } = useTheme();
  const [riveFailed, setRiveFailed] = useState(false);

  const gradient: [string, string] = isDark
    ? [colorPalettes.slate[900], colorPalettes.indigo[950]]
    : [colorPalettes.slate[50], colorPalettes.indigo[50]];

  const shouldTryRive =
    LESSONS_BACKGROUND_MODE === 'rive' && LESSONS_BACKGROUND_RIVE_URL.length > 0 && !riveFailed;

  if (shouldTryRive) {
    return (
      <Rive
        url={LESSONS_BACKGROUND_RIVE_URL}
        autoplay
        fit={Fit.Cover}
        onError={() => setRiveFailed(true)}
        style={StyleSheet.absoluteFill}
      />
    );
  }

  return (
    <LinearGradient
      colors={gradient}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
      style={StyleSheet.absoluteFill}
    />
  );
}
