// src/components/lessons/LessonNode/LessonNode.tsx
// Узел урока на дорожке: кружок + подпись (LessonInfo). Позиционирование
// (зигзаг, соединительная линия) — за LessonPath, этот компонент только
// презентационный, занимает фиксированный квадрат CIRCLE_SIZE×CIRCLE_SIZE —
// подпись выходит за его границы абсолютным позиционированием, не влияя на
// центрирование кружка в LessonPath.
//
// Состояние урока (domain/lesson/LessonPathNode.ts) различается не только
// цветом (§23): пройден без ошибок — звезда, пройден — галочка, начатый и
// следующий — кольцо цвета темы с «play», закрытый — замок; плюс подпись.
//
// Тап никогда не отключается на уровне кнопки (нет disabled): непройденный
// урок на вкладке «Уроки» не открывается, но тап по нему должен сработать и
// объяснить, где его пройти, — если бы кнопка была disabled, onPress вообще
// не вызвался бы. Решение «перейти или объяснить» принимает вызывающий код
// (см. lessons.tsx onPressLesson).

import { Ionicons } from '@expo/vector-icons';
import { View, TouchableOpacity } from 'react-native';

import { LessonPathNode } from '@/domain/lesson/LessonPathNode';
import { useResponsive, useTheme } from '@/theme';
import { spacing } from '@/theme/tokens';
import { LessonInfo, lessonStatusLabel } from '../LessonInfo';

const ICONS = {
  perfect: 'star',
  completed: 'checkmark',
  started: 'play',
  next: 'play',
  locked: 'lock-closed',
} as const;

export function LessonNode({
  item,
  branchColor,
  isPriority,
  infoAlign,
  labelMaxWidth,
  onPress,
}: {
  item: LessonPathNode;
  branchColor: string;
  isPriority: boolean;
  infoAlign: 'left' | 'right';
  /** Макс. ширина подписи урока — считается в LessonPath от реально
   * доступной ширины колонки, чтобы подпись не вылезала за экран. */
  labelMaxWidth: number;
  onPress: () => void;
}) {
  const { theme } = useTheme();
  const { scale } = useResponsive();

  const circleSize = scale(60);
  const { status } = item;
  const isDone = status === 'perfect' || status === 'completed';
  const isCurrent = status === 'started' || status === 'next';

  return (
    <View style={{ width: circleSize, height: circleSize }}>
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.8}
        accessibilityRole="button"
        accessibilityLabel={`${item.lesson.title}: ${lessonStatusLabel(item)}`}
        style={{
          width: circleSize,
          height: circleSize,
          borderRadius: circleSize / 2,
          alignItems: 'center',
          justifyContent: 'center',
          // Пройден — цвет темы; текущий (начат или следующий) — кольцо цвета
          // темы; закрыт — theme.border (контрастен на светлом фоне, без
          // доп. затемнения — иконка замка и так показывает состояние).
          backgroundColor: isDone ? branchColor : isCurrent ? theme.surface : theme.border,
          borderWidth: isCurrent ? scale(3) : 0,
          borderColor: branchColor,
        }}
      >
        <Ionicons
          name={ICONS[status]}
          size={scale(status === 'locked' ? 20 : 28)}
          color={isDone ? theme.onGradient : isCurrent ? branchColor : theme.textMuted}
        />
      </TouchableOpacity>

      <View
        style={{
          position: 'absolute',
          top: 0,
          bottom: 0,
          justifyContent: 'center',
          ...(infoAlign === 'left'
            ? { left: circleSize + scale(spacing.sm) }
            : { right: circleSize + scale(spacing.sm) }),
        }}
      >
        <LessonInfo
          item={item}
          isPriority={isPriority}
          align={infoAlign}
          maxWidth={labelMaxWidth}
        />
      </View>
    </View>
  );
}
