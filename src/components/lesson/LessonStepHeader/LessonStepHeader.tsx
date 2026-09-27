// src/components/lesson/LessonStepHeader/LessonStepHeader.tsx
// Общая шапка шага урока: закрыть, сквозной прогресс по всем шагам,
// бейдж настроения питомца. Настроение — просто индикатор (переиспользует
// getMoodEmoji/getMoodColor из lib/utils/formatters, не заводит ещё одну,
// четвёртую по счёту, систему mood-порогов), не штрафная механика — ошибка
// ребёнка не наказывается (§8 ТЗ). Справа — «?» с подсказкой, как устроен урок.

import { Text, View } from 'react-native';

import { HelpButton } from '@/components/shared';
import type { ScreenHelpId } from '@/domain/content/ReferenceContent';
import { IconButton } from '@/components/ui';
import { getMoodColor, getMoodEmoji } from '@/lib/utils/formatters';
import { useResponsive, useTheme } from '@/theme';
import { spacing } from '@/theme/tokens';
import { createLessonStepHeaderStyles } from './LessonStepHeader.styles';

export function LessonStepHeader({
  progress,
  onClose,
  petMood,
  help = 'lesson',
}: {
  progress: number;
  onClose: () => void;
  petMood: number;
  /** Подсказка «?»: про урок целиком, а на шаге мини-игры — как в неё играть. */
  help?: ScreenHelpId;
}) {
  const { theme } = useTheme();
  const { scale, scaledFont } = useResponsive();
  const styles = createLessonStepHeaderStyles({ theme });

  const clampedProgress = Math.max(0, Math.min(1, progress));

  return (
    <View style={styles.header}>
      <IconButton icon="close" onPress={onClose} variant="surface" iconSize={18} />

      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${clampedProgress * 100}%` }]} />
      </View>

      <View style={[styles.moodBadge, { paddingHorizontal: scale(spacing.sm) }]}>
        <Text style={{ fontSize: scaledFont('sm') }}>{getMoodEmoji(petMood)}</Text>
        <Text style={{ fontSize: scaledFont('xxs'), color: getMoodColor(petMood, theme) }}>
          {Math.round(petMood)}
        </Text>
      </View>

      <HelpButton screen={help} />
    </View>
  );
}
