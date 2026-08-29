// components/games/TinderSwipeGame.tsx
// Мини-игра «Скам-Свайпер» — свайп влево/вправо

import { useState } from 'react';
import { Dimensions, Text, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
    interpolate,
    runOnJS,
    useAnimatedStyle,
    useSharedValue,
    withSpring,
} from 'react-native-reanimated';

const { width } = Dimensions.get('window');
const SWIPE_THRESHOLD = width * 0.3;

interface TinderSwipeGameProps {
  scenario: string;
  isScam: boolean;
  onAnswer: (answer: string, isCorrect: boolean) => void;
  disabled?: boolean;
}

export function TinderSwipeGame({
  scenario,
  isScam,
  onAnswer,
  disabled = false,
}: TinderSwipeGameProps) {
  const translateX = useSharedValue(0);
  const rotate = useSharedValue(0);
  const [isProcessing, setIsProcessing] = useState(false);

  // Жест свайпа
  const panGesture = Gesture.Pan()
    .onUpdate((event) => {
      if (disabled || isProcessing) return;
      translateX.value = event.translationX;
      rotate.value = interpolate(event.translationX, [-width, width], [-15, 15]);
    })
    .onEnd((event) => {
      if (disabled || isProcessing) return;

      if (Math.abs(event.translationX) > SWIPE_THRESHOLD) {
        const isSwipeRight = event.translationX > 0;
        const answer = isSwipeRight ? 'safe' : 'scam';
        const isCorrect = (isSwipeRight && !isScam) || (!isSwipeRight && isScam);

        runOnJS(setIsProcessing)(true);

        // Анимация вылета карточки
        translateX.value = withSpring(isSwipeRight ? width * 1.5 : -width * 1.5, { damping: 20 });

        // Отправляем ответ
        setTimeout(() => {
          onAnswer(answer, isCorrect);
        }, 500);
      } else {
        // Возврат карточки
        translateX.value = withSpring(0);
        rotate.value = withSpring(0);
      }
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }, { rotate: `${rotate.value}deg` }],
  }));

  return (
    <View className="flex-1 justify-center items-center px-6">
      {/* Инструкция */}
      <Text className="text-slate-400 text-center mb-8">
        Свайпните влево, если это {'\n'}
        <Text className="text-red-400 font-semibold">СКАМ</Text>
        {'\n'}или вправо, если <Text className="text-green-400 font-semibold">БЕЗОПАСНО</Text>
      </Text>

      {/* Карточка сценария */}
      <GestureDetector gesture={panGesture}>
        <Animated.View
          style={animatedStyle}
          className="w-full bg-slate-800 rounded-3xl p-8 border border-slate-700 shadow-xl"
        >
          <View className="items-center">
            <Text className="text-4xl mb-4">💳</Text>
            <Text className="text-white text-xl font-medium text-center leading-relaxed">
              {scenario}
            </Text>
          </View>
        </Animated.View>
      </GestureDetector>

      {/* Индикаторы свайпа */}
      <View className="flex-row justify-between w-full mt-8 px-4">
        <View className="items-center">
          <View className="w-16 h-16 rounded-full bg-red-500/20 items-center justify-center mb-2">
            <Text className="text-3xl">🚫</Text>
          </View>
          <Text className="text-red-400 font-medium">Скам</Text>
        </View>
        <View className="items-center">
          <View className="w-16 h-16 rounded-full bg-green-500/20 items-center justify-center mb-2">
            <Text className="text-3xl">✅</Text>
          </View>
          <Text className="text-green-400 font-medium">Безопасно</Text>
        </View>
      </View>
    </View>
  );
}
