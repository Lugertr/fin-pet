// src/components/lessons/LessonInfo/LessonInfo.tsx
// Информация об уроке рядом с кружком на дереве уроков

import { View } from 'react-native';
import { Text } from '@/components/ui/Text';

import { isNodeLesson } from '@/domain/lesson/LessonPlan';
import { Lesson } from '@/lib/hooks/useLessons';
import { pluralize } from '@/lib/utils/formatters';
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
          {isCompleted ? '✓ Пройдено' : lessonKindLabel(lesson)}
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

/** Подпись урока: у урока из узлов — сколько в нём этапов (как на треке смены). */
function lessonKindLabel(lesson: Lesson): string {
  if (isNodeLesson(lesson)) {
    const stages = lesson.nodes.length + 1;
    return `${stages} ${pluralize(stages, 'этап', 'этапа', 'этапов')}`;
  }
  if (lesson.minigame_type === 'quiz') return 'Викторина';
  if (lesson.minigame_type === 'five_letters') return '5 букв';
  return 'Мини-игра';
}
