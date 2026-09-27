// src/components/lessons/LessonNode/LessonNode.tsx
// Узел урока на дорожке: кружок + подпись (LessonInfo). Позиционирование
// (зигзаг, соединительная линия) — за LessonPath, этот компонент только
// презентационный, занимает фиксированный квадрат CIRCLE_SIZE×CIRCLE_SIZE —
// подпись выходит за его границы абсолютным позиционированием, не влияя на
// центрирование кружка в LessonPath.
//
// Тап никогда не отключается на уровне кнопки (нет disabled): на вкладке
// «Уроки» непройденный урок выглядит заблокированным, но тап по нему должен
// сработать и показать алерт «пройти можно в приключении» — если бы кнопка
// была disabled, onPress вообще не вызвался бы. Решение «перейти или
// показать алерт» принимает вызывающий код (см. lessons.tsx onPressLesson).

import { Ionicons } from '@expo/vector-icons';
import { View, TouchableOpacity } from 'react-native';

import { Lesson } from '@/lib/hooks/useLessons';
import { useResponsive, useTheme } from '@/theme';
import { spacing } from '@/theme/tokens';
import { LessonInfo } from '../LessonInfo';

export function LessonNode({
  lesson,
  isCompleted,
  branchColor,
  isPriority,
  infoAlign,
  labelMaxWidth,
  onPress,
}: {
  lesson: Lesson;
  isCompleted: boolean;
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

  return (
    <View style={{ width: circleSize, height: circleSize }}>
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.8}
        style={{
          width: circleSize,
          height: circleSize,
          borderRadius: circleSize / 2,
          alignItems: 'center',
          justifyContent: 'center',
          // На вкладке «Уроки» пройти можно только уже пройденный урок (см.
          // lessons.tsx onPressLesson), поэтому у узла ровно два вида: пройден
          // (цвет ветки) или заблокирован (theme.border — раньше был
          // surfaceLight, почти сливавшийся со светлым фоном экрана, §1 бага).
          // Никакого доп. затемнения (opacity) поверх — оно бы снова снизило
          // контраст, а иконка замка и так однозначно показывает состояние.
          backgroundColor: isCompleted ? branchColor : theme.border,
        }}
      >
        {isCompleted ? (
          <Ionicons name="checkmark" size={scale(28)} color={theme.onGradient} />
        ) : (
          <Ionicons name="lock-closed" size={scale(20)} color={theme.textMuted} />
        )}
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
          lesson={lesson}
          isCompleted={isCompleted}
          isPriority={isPriority}
          align={infoAlign}
          maxWidth={labelMaxWidth}
        />
      </View>
    </View>
  );
}
