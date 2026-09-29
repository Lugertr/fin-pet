// src/components/lessons/LessonInfo/LessonInfo.tsx
// Информация об уроке рядом с кружком на дереве уроков: название и
// состояние — «★ Идеально», «✓ Пройдено», «Начат · 1/4» (продолжится с того
// же этапа; значок «play» у кружка), «Следующий» или число этапов у закрытого.
// Этапы — по тому же плану, что и трек смены (в демо урок короче).

import { View } from 'react-native';
import { Text } from '@/components/ui/Text';

import { LessonPathNode } from '@/domain/lesson/LessonPathNode';
import { pluralize } from '@/lib/utils/formatters';
import { useResponsive, useTheme } from '@/theme';
import { fontWeights } from '@/theme/tokens';

export function LessonInfo({
  item,
  isPriority,
  align,
  maxWidth,
}: {
  item: LessonPathNode;
  isPriority: boolean;
  align: 'left' | 'right';
  /** Считается в LessonPath от реально доступной ширины колонки. */
  maxWidth: number;
}) {
  const { theme } = useTheme();
  const { scaledFont } = useResponsive();
  const isDone = item.status === 'perfect' || item.status === 'completed';
  const isCurrent = item.status === 'started' || item.status === 'next';

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
        {item.lesson.title}
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
            color: isDone ? theme.success : isCurrent ? theme.primary : theme.textMuted,
            fontSize: scaledFont('xxs'),
            textTransform: 'uppercase',
            fontWeight: fontWeights.semibold,
          }}
        >
          {lessonStatusLabel(item)}
        </Text>
        {/* Тема идущей смены (раньше «+10%» — надбавки за урок в смене больше нет). */}
        {isPriority && !isDone && (
          <Text
            style={{
              color: theme.success,
              fontSize: scaledFont('xxs'),
              fontWeight: fontWeights.bold,
            }}
          >
            В смене
          </Text>
        )}
      </View>
    </View>
  );
}

/** Подпись состояния урока — и под кружком, и для экранного диктора. */
export function lessonStatusLabel(item: LessonPathNode): string {
  switch (item.status) {
    case 'perfect':
      return '★ Идеально';
    case 'completed':
      return '✓ Пройдено';
    case 'started':
      return `Начат · ${item.nodesDone}/${item.nodesTotal}`;
    case 'next':
      return 'Следующий';
    case 'locked':
      return `${item.nodesTotal} ${pluralize(item.nodesTotal, 'этап', 'этапа', 'этапов')}`;
  }
}
