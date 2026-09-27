// src/components/games/TinderSwipeGame/TinderSwipeGame.tsx
// Мини-игра в стиле Tinder/Reigns — свайпы для оценки финансовых ситуаций.
//
// «Безопасно»/«Рискованно» не закреплены жёстко за правой/левой стороной —
// какой из options[0]/options[1] считается безопасным, определяет
// correct_answer конкретного вопроса (см. content/lessons.json), поэтому
// цвет и подпись угловых плашек и подсветка при свайпе считаются от этого
// один раз на вопрос (leftIsSafe), а не хардкодятся по стороне.

import { Ionicons } from '@expo/vector-icons';
import { useRef, useState } from 'react';
import { TouchableOpacity, View } from 'react-native';
import { Text } from '@/components/ui/Text';
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
import { withAlpha } from '@/theme/colorUtils';
import { createTinderSwipeGameStyles, SWIPE_THRESHOLD } from './TinderSwipeGame.styles';

interface TinderSwipeGameProps {
  question: string;
  options: string[];
  correctAnswer: string;
  /** Текст баннера обратной связи после свайпа (см. content/lessons.json) —
   * баннера не будет, если для вопроса не задан. */
  explanation?: string;
  /** Текст под ссылкой «Подсказка» — сама ссылка не показывается без него. */
  hint?: string;
  /** Показать «N / M утверждений» внизу — оба значения нужны вместе. */
  progressCurrent?: number;
  progressTotal?: number;
  onAnswer: (answer: string, isCorrect: boolean) => void;
  disabled?: boolean;
}

export function TinderSwipeGame({
  question,
  options,
  correctAnswer,
  explanation,
  hint,
  progressCurrent,
  progressTotal,
  onAnswer,
  disabled = false,
}: TinderSwipeGameProps) {
  const { theme } = useTheme();
  const { width } = useResponsive();
  const { trigger, triggerHaptic } = useFeedback();

  const [isAnimating, setIsAnimating] = useState(false);
  const [answeredOption, setAnsweredOption] = useState<string | null>(null);
  const [isHintRevealed, setIsHintRevealed] = useState(false);
  // Ref, а не только state: гарантирует, что повторный swipe/tap в ту же
  // самую задачу микротасков не проскочит мимо проверки isAnimating из-за
  // устаревшего замыкания до того, как React применит setIsAnimating(true).
  const isProcessingRef = useRef(false);

  const styles = createTinderSwipeGameStyles({ theme });

  // Анимации карточки
  const translateX = useSharedValue(0);
  const rotate = useSharedValue(0);
  const likeOpacity = useSharedValue(0);
  const nopeOpacity = useSharedValue(0);

  const leftOption = options[0] || 'Отказаться';
  const rightOption = options[1] || 'Согласиться';
  const leftIsSafe = leftOption === correctAnswer;

  const resetCard = () => {
    translateX.value = withSpring(0);
    rotate.value = withSpring(0);
    likeOpacity.value = withTiming(0, { duration: 150 });
    nopeOpacity.value = withTiming(0, { duration: 150 });
    setAnsweredOption(null);
  };

  // Единственная точка входа для обоих путей (жест и кнопки) — раньше
  // isAnimating выставлялся только в handleButtonSwipe, а сам свайп жестом
  // (panGesture.onEnd) вызывал эту функцию напрямую, ничего не блокируя. Из-за
  // задержки в 350мс до onAnswer окно было открыто для повторного свайпа —
  // второй быстрый свайп успевал запустить handleSwipeComplete ещё раз до
  // того, как onAnswer вообще срабатывал, и на один вопрос прилетало два
  // ответа. isProcessingRef проверяется и выставляется синхронно, поэтому не
  // ловит гонку устаревшего замыкания, в отличие от одного только state.
  const handleSwipeComplete = (direction: 'left' | 'right') => {
    if (disabled || isProcessingRef.current) return;
    isProcessingRef.current = true;
    setIsAnimating(true);

    const chosenOption = direction === 'left' ? leftOption : rightOption;
    const isCorrect = chosenOption === correctAnswer;
    setAnsweredOption(chosenOption);

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
        setIsAnimating(false);
        isProcessingRef.current = false;
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
    // .onEnd(fn) только СОХРАНЯЕТ fn для будущего вызова из нативного жеста
    // (через runOnJS, на JS-потоке), не выполняет его во время этого рендера —
    // линтер не умеет отличать билдер-API Gesture Handler от немедленного
    // вызова и репортит ложное срабатывание на чтение isProcessingRef.current
    // внутри handleSwipeComplete.
    // eslint-disable-next-line react-hooks/refs
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
    handleSwipeComplete(direction);
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

  const isAnsweredCorrect = answeredOption !== null && answeredOption === correctAnswer;

  return (
    <View style={styles.container}>
      {/* Результат — над стопкой карточек, показывается сразу по свайпу */}
      {answeredOption !== null && (
        <View
          style={[
            styles.feedbackContainer,
            {
              backgroundColor: isAnsweredCorrect
                ? withAlpha(theme.success, 0.15)
                : withAlpha(theme.error, 0.15),
              borderColor: isAnsweredCorrect
                ? withAlpha(theme.success, 0.4)
                : withAlpha(theme.error, 0.4),
            },
          ]}
        >
          <Text
            style={[
              styles.feedbackText,
              { color: isAnsweredCorrect ? theme.success : theme.error },
            ]}
          >
            {isAnsweredCorrect ? 'Безопасно' : 'Рискованно'}
            {explanation ? `: ${explanation}` : '!'}
          </Text>
        </View>
      )}

      {/* Область с карточкой: 2 декоративные карточки-«тени» позади для
          глубины стопки (без содержимого — следующий вопрос ещё не выбран
          на этом уровне, см. MinigameStep), сверху — рабочая карточка. */}
      <View style={styles.cardArea}>
        <View style={[styles.stackCardBase, styles.stackCardBack2]} />
        <View style={[styles.stackCardBase, styles.stackCardBack1]} />

        <GestureDetector gesture={panGesture}>
          <Animated.View style={[styles.card, animatedCardStyle]}>
            <View style={styles.cardInner}>
              {/* Угловые плашки: какая сторона безопасна/рискованна — не
                  привязаны к стороне жёстко, см. leftIsSafe выше. */}
              <View
                style={[
                  styles.cornerPill,
                  styles.cornerPillLeft,
                  { borderColor: leftIsSafe ? theme.success : theme.error },
                ]}
              >
                <Text
                  style={[
                    styles.cornerPillText,
                    { color: leftIsSafe ? theme.success : theme.error },
                  ]}
                >
                  ← {leftIsSafe ? 'безопасно' : 'рискованно'}
                </Text>
              </View>
              <View
                style={[
                  styles.cornerPill,
                  styles.cornerPillRight,
                  { borderColor: leftIsSafe ? theme.error : theme.success },
                ]}
              >
                <Text
                  style={[
                    styles.cornerPillText,
                    { color: leftIsSafe ? theme.error : theme.success },
                  ]}
                >
                  {leftIsSafe ? 'рискованно' : 'безопасно'} →
                </Text>
              </View>

              <View style={styles.situationIconContainer}>
                <Ionicons name="lock-closed" size={32} color={theme.onGradient} />
              </View>

              <Text style={styles.situationLabel}>Ситуация</Text>

              <Text style={styles.questionText}>{question}</Text>

              {/* Индикатор при свайпе вправо */}
              <Animated.View style={[styles.likeBadge, animatedLikeStyle]}>
                <Text
                  style={[
                    styles.swipeFeedbackText,
                    { color: leftIsSafe ? theme.error : theme.success },
                  ]}
                >
                  {leftIsSafe ? '⚠️ Рискованно' : '✅ Безопасно'}
                </Text>
              </Animated.View>

              {/* Индикатор при свайпе влево */}
              <Animated.View style={[styles.nopeBadge, animatedNopeStyle]}>
                <Text
                  style={[
                    styles.swipeFeedbackText,
                    { color: leftIsSafe ? theme.success : theme.error },
                  ]}
                >
                  {leftIsSafe ? '✅ Безопасно' : '⚠️ Рискованно'}
                </Text>
              </Animated.View>
            </View>
          </Animated.View>
        </GestureDetector>
      </View>

      {/* Кнопки свайпа */}
      <View style={styles.buttonsContainer}>
        <TouchableOpacity
          onPress={() => handleButtonSwipe('left')}
          disabled={disabled || isAnimating}
          activeOpacity={0.7}
          style={[
            styles.swipeButtonOuter,
            { backgroundColor: withAlpha(leftIsSafe ? theme.success : theme.error, 0.2) },
          ]}
        >
          <View
            style={[
              styles.swipeButtonInner,
              { borderColor: leftIsSafe ? theme.success : theme.error },
            ]}
          >
            <Ionicons
              name={leftIsSafe ? 'checkmark' : 'close'}
              size={32}
              color={leftIsSafe ? theme.success : theme.error}
            />
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => handleButtonSwipe('right')}
          disabled={disabled || isAnimating}
          activeOpacity={0.7}
          style={[
            styles.swipeButtonOuter,
            { backgroundColor: withAlpha(leftIsSafe ? theme.error : theme.success, 0.2) },
          ]}
        >
          <View
            style={[
              styles.swipeButtonInner,
              { borderColor: leftIsSafe ? theme.error : theme.success },
            ]}
          >
            <Ionicons
              name={leftIsSafe ? 'close' : 'checkmark'}
              size={32}
              color={leftIsSafe ? theme.error : theme.success}
            />
          </View>
        </TouchableOpacity>
      </View>

      {/* Прогресс + подсказка */}
      <View style={styles.footerRow}>
        {progressCurrent !== undefined && progressTotal !== undefined && (
          <Text style={styles.progressCaption}>
            {progressCurrent} / {progressTotal} утверждений
          </Text>
        )}
        {hint && (
          <TouchableOpacity onPress={() => setIsHintRevealed((v) => !v)} activeOpacity={0.7}>
            <Text style={styles.hintLink}>{isHintRevealed ? 'Скрыть подсказку' : 'Подсказка'}</Text>
          </TouchableOpacity>
        )}
      </View>
      {hint && isHintRevealed && <Text style={styles.hintText}>{hint}</Text>}
    </View>
  );
}
