// src/components/ui/AnimatedFill/AnimatedFill.tsx
// Заливка-прогресс, которая плавно доезжает до новой доли при каждом
// изменении percent: поля распределения на планировании приключения и
// прогресс цели в «Копилке». Анимация на UI-потоке (Reanimated); при
// включённом в системе «уменьшении движения» Reanimated сразу показывает
// итоговое значение. Смысл заливки дублируется текстом рядом (§23).

import { useEffect } from 'react';
import { StyleProp, ViewStyle } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

export function AnimatedFill({
  percent,
  color,
  style,
}: {
  /** 0–100. */
  percent: number;
  color: string;
  style?: StyleProp<ViewStyle>;
}) {
  const progress = useSharedValue(percent);

  useEffect(() => {
    progress.value = withTiming(percent, { duration: 320, easing: Easing.out(Easing.cubic) });
  }, [percent, progress]);

  const animatedStyle = useAnimatedStyle(() => ({ width: `${progress.value}%` }));

  return <Animated.View style={[style, { backgroundColor: color }, animatedStyle]} />;
}
