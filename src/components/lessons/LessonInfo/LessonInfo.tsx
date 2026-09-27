// src/components/lessons/LessonInfo/LessonInfo.tsx
// Информация об уроке рядом с кружком на дереве уроков

import { View } from 'react-native';
import { Text } from '@/components/ui/Text';

import { Lesson } from '@/lib/hooks/useLessons';
import { useResponsive, useTheme } from '@/theme';
import { fontWeights } from '@/theme/tokens';

export function LessonInfo({
  lesson,
  isCompleted,
  isPriority,
  align,
  maxWidth,
}: {
  lesson: Lesson;
  isCompleted: boolean;
  isPriority: boolean;
  align: 'left' | 'right';
  /** Считается в LessonPath от реально доступной ширины колонки. */
  maxWidth: number;
}) {
  const { theme } = useTheme();
  const { scaledFont } = useResponsive();

  return (
    <View style={{ maxWidth }}>
      <Text
        style={{
          color: theme.textPrimary,
          fontWeight: fontWeights.semibold,
          fontSize: scaledFont('sm'),
          textAlign: align,
        }}
        numberOfLines={1}
        adjustsFontSizeToFit
        minimumFontScale={0.7}
      >
        {lesson.title}
      </Text>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 4,
          marginTop: 2,
          justifyContent: align === 'left' ? 'flex-start' : 'flex-end',
        }}
      >
        <Text
          style={{
            color: isCompleted ? theme.success : theme.textMuted,
            fontSize: scaledFont('xxs'),
            textTransform: 'uppercase',
            fontWeight: fontWeights.semibold,
          }}
        >
          {isCompleted
            ? '✓ Пройдено'
            : lesson.minigame_type === 'quiz'
              ? 'Викторина'
              : lesson.minigame_type === 'five_letters'
                ? '5 букв'
                : 'Мини-игра'}
        </Text>
        {isPriority && !isCompleted && (
          <Text
            style={{
              color: theme.success,
              fontSize: scaledFont('xxs'),
              fontWeight: fontWeights.bold,
            }}
          >
            +10%
          </Text>
        )}
      </View>
    </View>
  );
}
