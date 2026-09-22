// src/components/lessons/LessonNode/LessonNode.tsx
// Узел урока на дорожке: кружок + подпись (LessonInfo). Позиционирование
// (зигзаг, соединительная линия) — за LessonPath, этот компонент только
// презентационный, занимает фиксированный квадрат CIRCLE_SIZE×CIRCLE_SIZE —
// подпись выходит за его границы абсолютным позиционированием, не влияя на
// центрирование кружка в LessonPath.

import { Ionicons } from '@expo/vector-icons';
import { View, TouchableOpacity } from 'react-native';

import { Lesson } from '@/lib/hooks/useLessons';
import { useResponsive, useTheme } from '@/theme';
import { spacing } from '@/theme/tokens';
import { LessonInfo } from '../LessonInfo';

export function LessonNode({
  lesson,
  isCompleted,
  isCurrent,
  isAvailable,
  branchColor,
  isPriority,
  infoAlign,
  labelMaxWidth,
  onPress,
}: {
  lesson: Lesson;
  isCompleted: boolean;
  isCurrent: boolean;
  isAvailable: boolean;
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
        disabled={!isAvailable}
        activeOpacity={0.8}
        style={{
          width: circleSize,
          height: circleSize,
          borderRadius: circleSize / 2,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: isCompleted
            ? branchColor
            : isCurrent
              ? theme.onGradient
              : theme.surfaceLight,
          borderWidth: isCurrent ? scale(3) : 0,
          borderColor: isCurrent ? branchColor : 'transparent',
          opacity: isAvailable ? 1 : 0.5,
          shadowColor: isCurrent ? branchColor : 'transparent',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: isCurrent ? 0.4 : 0,
          shadowRadius: 8,
          elevation: isCurrent ? 8 : 0,
        }}
      >
        {isCompleted ? (
          <Ionicons name="checkmark" size={scale(28)} color={theme.onGradient} />
        ) : isCurrent ? (
          <Ionicons name="play" size={scale(22)} color={branchColor} />
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
