// src/components/games/TinderSwipeGame/TinderSwipeGame.tsx
// Мини-игра в стиле Tinder/Reigns — свайпы для оценки финансовых ситуаций

import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
    runOnJS,
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    withTiming,
} from 'react-native-reanimated';

import { useFeedback } from '@/lib/hooks/useFeedback';
import { useResponsive, useTheme } from '@/theme';
import { createTinderSwipeGameStyles, SWIPE_THRESHOLD } from './TinderSwipeGame.styles';

interface TinderSwipeGameProps {
  question: string;
  options: string[];
  correctAnswer: string;
  onAnswer: (answer: string, isCorrect: boolean) => void;
  disabled?: boolean;
}

export function TinderSwipeGame({
  question,
  options,
  correctAnswer,
  onAnswer,
  disabled = false,
}: TinderSwipeGameProps) {
  const { theme } = useTheme();
  const { width } = useResponsive();
  const { trigger, triggerHaptic } = useFeedback();

  const [isAnimating, setIsAnimating] = useState(false);

  const styles = createTinderSwipeGameStyles({ theme });

  // Анимации карточки
  const translateX = useSharedValue(0);
  const rotate = useSharedValue(0);
  const likeOpacity = useSharedValue(0);
  const nopeOpacity = useSharedValue(0);

  const leftOption = options[0] || 'Отказаться';
  const rightOption = options[1] || 'Согласиться';

  const resetCard = () => {
    translateX.value = withSpring(0);
    rotate.value = withSpring(0);
    likeOpacity.value = withTiming(0, { duration: 150 });
    nopeOpacity.value = withTiming(0, { duration: 150 });
  };

  const handleSwipeComplete = (direction: 'left' | 'right') => {
    const chosenOption = direction === 'left' ? leftOption : rightOption;
    const isCorrect = chosenOption === correctAnswer;

    // ЗВУК + HAPTIC вызываются ТОЛЬКО здесь
    trigger(isCorrect ? 'correctAnswer' : 'wrongAnswer');

    // Анимируем вылет карточки
    const flyX = direction === 'left' ? -width : width;
    translateX.value = withTiming(flyX, { duration: 300 });
    rotate.value = withTiming(direction === 'left' ? -30 : 30, { duration: 300 });

    setTimeout(() => {
      onAnswer(chosenOption, isCorrect);
      setTimeout(() => {
        resetCard();
      }, 400);
    }, 350);
  };

  // Жест свайпа
  const panGesture = Gesture.Pan()
    .enabled(!disabled && !isAnimating)
    .onUpdate((event) => {
      translateX.value = event.translationX;
      rotate.value = event.translationX / 20;

      if (event.translationX > 30) {
        likeOpacity.value = Math.min(event.translationX / SWIPE_THRESHOLD, 1);
        nopeOpacity.value = 0;
      } else if (event.translationX < -30) {
        nopeOpacity.value = Math.min(-event.translationX / SWIPE_THRESHOLD, 1);
        likeOpacity.value = 0;
      } else {
        likeOpacity.value = 0;
        nopeOpacity.value = 0;
      }
    })
    .onEnd((event) => {
      if (Math.abs(event.translationX) > SWIPE_THRESHOLD) {
        const direction = event.translationX > 0 ? 'right' : 'left';
        runOnJS(handleSwipeComplete)(direction);
      } else {
        translateX.value = withSpring(0, { damping: 10 });
        rotate.value = withSpring(0, { damping: 10 });
        likeOpacity.value = withTiming(0, { duration: 200 });
        nopeOpacity.value = withTiming(0, { duration: 200 });
      }
    });

  const handleButtonSwipe = (direction: 'left' | 'right') => {
    if (disabled || isAnimating) return;
    triggerHaptic('light');
    setIsAnimating(true);
    handleSwipeComplete(direction);
    setTimeout(() => setIsAnimating(false), 700);
  };

  const animatedCardStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }, { rotate: `${rotate.value}deg` }],
  }));

  const animatedLikeStyle = useAnimatedStyle(() => ({
    opacity: likeOpacity.value,
    transform: [{ scale: likeOpacity.value }],
  }));

  const animatedNopeStyle = useAnimatedStyle(() => ({
    opacity: nopeOpacity.value,
    transform: [{ scale: nopeOpacity.value }],
  }));

  return (
    <View style={styles.container}>
      {/* Инструкция */}
      <View style={styles.instructionBanner}>
        <Ionicons name="hand-left" size={20} color={theme.primary} />
        <Text style={styles.instructionText}>Свайпните карточку или используйте кнопки внизу</Text>
      </View>

      {/* Область с карточкой */}
      <View style={styles.cardArea}>
        <GestureDetector gesture={panGesture}>
          <Animated.View style={[styles.card, animatedCardStyle]}>
            <View
              style={{
                flex: 1,
                backgroundColor: theme.surface,
              }}
            >
              <View style={styles.cardInner}>
                {/* Иконка ситуации */}
                <View style={styles.situationIconContainer}>
                  <Text style={styles.situationEmoji}>🕵️</Text>
                </View>

                <Text style={styles.situationLabel}>Ситуация</Text>

                <Text style={styles.questionText}>{question}</Text>

                {/* Разделитель */}
                <View style={styles.divider} />

                {/* Варианты ответов */}
                <View style={styles.optionsContainer}>
                  <View style={styles.leftOptionBox}>
                    <Text style={styles.optionEmoji}>👈</Text>
                    <Text style={styles.leftOptionText}>{leftOption}</Text>
                  </View>
                  <View style={styles.rightOptionBox}>
                    <Text style={styles.optionEmoji}>👉</Text>
                    <Text style={styles.rightOptionText}>{rightOption}</Text>
                  </View>
                </View>

                {/* Индикатор LIKE */}
                <Animated.View style={[styles.likeBadge, animatedLikeStyle]}>
                  <Text style={styles.likeText}>✅ ДА</Text>
                </Animated.View>

                {/* Индикатор NOPE */}
                <Animated.View style={[styles.nopeBadge, animatedNopeStyle]}>
                  <Text style={styles.nopeText}>❌ НЕТ</Text>
                </Animated.View>
              </View>
            </View>
          </Animated.View>
        </GestureDetector>
      </View>

      {/* Кнопки свайпа */}
      <View style={styles.buttonsContainer}>
        {/* Кнопка NOPE (влево) */}
        <TouchableOpacity
          onPress={() => handleButtonSwipe('left')}
          disabled={disabled || isAnimating}
          activeOpacity={0.7}
          style={[styles.swipeButtonOuter, { backgroundColor: 'rgba(239, 68, 68, 0.2)' }]}
        >
          <View style={[styles.swipeButtonInner, { borderColor: theme.error }]}>
            <Ionicons name="close" size={32} color={theme.error} />
          </View>
        </TouchableOpacity>

        {/* Кнопка LIKE (вправо) */}
        <TouchableOpacity
          onPress={() => handleButtonSwipe('right')}
          disabled={disabled || isAnimating}
          activeOpacity={0.7}
          style={[styles.swipeButtonOuter, { backgroundColor: 'rgba(16, 185, 129, 0.2)' }]}
        >
          <View style={[styles.swipeButtonInner, { borderColor: theme.success }]}>
            <Ionicons name="checkmark" size={32} color={theme.success} />
          </View>
        </TouchableOpacity>
      </View>

      {/* Подсказка */}
      <Text style={styles.hintText}>Подумайте, что бы вы сделали в этой ситуации?</Text>
    </View>
  );
}
